import User "Types";
import RBTree "mo:base/RBTree";
import Text "mo:base/Text";
import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Nat "mo:base/Nat";

persistent actor Main {
    transient let tree = RBTree.RBTree<Text, User.User>(Text.compare);
    transient var followingMap = HashMap.HashMap<Text, Buffer.Buffer<User.User>>(0, Text.equal, Text.hash);
    transient var subscriptionMap = HashMap.HashMap<Text, Buffer.Buffer<User.Subscribe>>(0, Text.equal, Text.hash);
    
    public func getUser(principal_id: Text) : async Result.Result<User.User, Text> { 
        switch(tree.get(principal_id)) {
            case null {
                #err("User not found")
            };
            case (?user) {
                #ok(user)
            };
        }
    };
    
    public func register(principal_id: Text, userData: User.User) : async Result.Result<User.User, Text> {
        switch(tree.get(principal_id)) {
            case null {
                let newUser : User.User = {
                    principal_id = userData.principal_id;
                    username = userData.username;
                    profile_picture = userData.profile_picture;
                    created_at = Time.now(); 
                    streaming_key = userData.streaming_key;
                };
                tree.put(principal_id, newUser);
                #ok(userData)
            };
            case (?_) {
                #err("User already exists")
            };
        }
    };
   
    public func deleteUser(principal_id: Text) : async Result.Result<Text, Text> {
        switch(tree.get(principal_id)) {
            case null {
                #err("User not found")
            };
            case (?_) {
                tree.delete(principal_id);
                #ok("User deleted successfully")
            };
        }
    };

    public func follow(followerPrincipal: Text, targetPrincipal: Text) : async Result.Result<Text, Text> {
        switch(tree.get(targetPrincipal)) {
            case null { #err("Target user not found") };
            case (?targetUser) {
                switch(tree.get(followerPrincipal)) {
                    case null { #err("Follower user not found") };
                    case (?_) {
                        if (followerPrincipal == targetPrincipal) {
                            return #err("Cannot follow yourself");
                        };
                        
                        let followingList = switch (followingMap.get(followerPrincipal)) {
                            case null {
                                let newBuffer = Buffer.Buffer<User.User>(0);
                                followingMap.put(followerPrincipal, newBuffer);
                                newBuffer;
                            };
                            case (?existing) { existing };
                        };

                        let alreadyFollowing = Buffer.toArray(followingList) 
                            |> Array.find<User.User>(_, func(user) { user.principal_id == targetPrincipal });
                        
                        switch (alreadyFollowing) {
                            case (?_) { #err("Already following this user") };
                            case null {
                                followingList.add(targetUser);
                                #ok("Successfully followed user");
                            };
                        };
                    };
                };
            };
        };
    };

     public func unfollow(followerPrincipal: Text, targetPrincipal: Text) : async Result.Result<Text, Text> {
        switch (followingMap.get(followerPrincipal)) {
            case null { #err("User is not following anyone") };
            case (?followingList) {
                let followingArray = Buffer.toArray(followingList);
                let newFollowingArray = Array.filter<User.User>(followingArray, func(user) { 
                    user.principal_id != targetPrincipal 
                });
                
                if (followingArray.size() == newFollowingArray.size()) {
                    #err("Not following this user");
                } else {
                    let newBuffer = Buffer.Buffer<User.User>(0);
                    for (user in newFollowingArray.vals()) {
                        newBuffer.add(user);
                    };
                    followingMap.put(followerPrincipal, newBuffer);
                    #ok("Successfully unfollowed user");
                };
            };
        };
    };

     public func getAllFollowing(userPrincipal: Text) : async Result.Result<[User.Following], Text> {
        switch(tree.get(userPrincipal)) {
            case null { #err("User not found") };
            case (?_) {
                switch (followingMap.get(userPrincipal)) {
                    case null { #ok([]) };
                    case (?followingList) {
                        let followingArray = Buffer.toArray(followingList);
                        let result = Array.map<User.User, User.Following>(followingArray, func(user) {
                            {
                                principal_id = userPrincipal;
                                following = user;
                            }
                        });
                        #ok(result);
                    };
                };
            };
        };
    };

    public func getAllFollowers(userPrincipal: Text) : async Result.Result<[User.Following], Text> {
        switch(tree.get(userPrincipal)) {
            case null { #err("User not found") };
            case (?_) {
                let followersBuffer = Buffer.Buffer<User.User>(0);
                
                for ((principal, followingList) in followingMap.entries()) {
                    let followingArray = Buffer.toArray(followingList);
                    
                    let isFollowing = Array.find<User.User>(followingArray, func(user) {
                        user.principal_id == userPrincipal
                    });
                    
                    switch(isFollowing) {
                        case (?_) {
                            switch(tree.get(principal)) {
                                case (?followerUser) {
                                    followersBuffer.add(followerUser);
                                };
                                case null {  };
                            };
                        };
                        case null {  };
                    };
                };
                
                let followersArray = Buffer.toArray(followersBuffer);
                let result = Array.map<User.User, User.Following>(followersArray, func(user) {
                    {
                        principal_id = userPrincipal;
                        following = user;
                    }
                });
                
                #ok(result);
            };
        };
    };

    public func isFollowing(followerPrincipal: Text, targetPrincipal: Text) : async Result.Result<Bool, Text> {
        switch(tree.get(followerPrincipal)) {
            case null { #err("Follower user not found") };
            case (?_) {
                switch(tree.get(targetPrincipal)) {
                    case null { #err("Target user not found") };
                    case (?_) {
                        switch (followingMap.get(followerPrincipal)) {
                            case null { #ok(false) };
                            case (?followingList) {
                                let followingArray = Buffer.toArray(followingList);
                                let isFollowingUser = switch (Array.find<User.User>(followingArray, func(user) { user.principal_id == targetPrincipal })) {
                                    case null { false };
                                    case (?_) { true };
                                };
                                #ok(isFollowingUser);
                            };
                        };
                    };
                };
            };
        };
    };

    public func getFollowersCount(targetPrincipal: Text) : async Result.Result<Nat, Text> {
        switch(tree.get(targetPrincipal)) {
            case null { #err("User not found") };
            case (?_) {
                var count = 0;
                for ((_, followingList) in followingMap.entries()) {
                    let followingArray = Buffer.toArray(followingList);
                    switch (Array.find<User.User>(followingArray, func(user) { user.principal_id == targetPrincipal })) {
                        case null { };
                        case (?_) { count += 1 };
                    };
                };
                #ok(count);
            };
        };
    };

    public func getFollowingCount(userPrincipal: Text) : async Result.Result<Nat, Text> {
        switch(tree.get(userPrincipal)) {
            case null { #err("User not found") };
            case (?_) {
                switch (followingMap.get(userPrincipal)) {
                    case null { #ok(0) };
                    case (?followingList) { #ok(followingList.size()) };
                };
            };
        };
    };

    public func getAllUsers() : async [User.User] {
        let entries = tree.entries();
        let entriesArray = Iter.toArray(entries);
        Array.map<(Text, User.User), User.User>(entriesArray, func((_, user)) { user })
    };

    public func getUserByStreamingKey(streaming_key: Text) : async Result.Result<User.User, Text> {
        for ((principal_id, user) in tree.entries()) {
            if (user.streaming_key == streaming_key) {
                return #ok(user);
            };
        };
        #err("User not found with streaming key")
    };

    public func subscribe(subscriberPrincipal: Text, targetPrincipal: Text, months: Nat) : async Result.Result<Text, Text> {
        switch(tree.get(subscriberPrincipal)) {
            case null { return #err("Subscriber user not found") };
            case (?_) {
                switch(tree.get(targetPrincipal)) {
                    case null { return #err("Target user not found") };
                    case (?targetUser) {
                        if (subscriberPrincipal == targetPrincipal) {
                            return #err("Cannot subscribe to yourself");
                        };

                        let subscriptionList = switch (subscriptionMap.get(subscriberPrincipal)) {
                            case null {
                                let newBuffer = Buffer.Buffer<User.Subscribe>(0);
                                subscriptionMap.put(subscriberPrincipal, newBuffer);
                                newBuffer;
                            };
                            case (?existing) { existing };
                        };

                        let subscriptionArray = Buffer.toArray(subscriptionList);
                        let existingSubscription = Array.find<User.Subscribe>(subscriptionArray, func(sub) { 
                            sub.subscribing.principal_id == targetPrincipal 
                        });

                        let currentTime = Time.now();
                        let monthsInNanoseconds = months * 30 * 24 * 60 * 60 * 1_000_000_000; 

                        switch (existingSubscription) {
                            case (?existing) {
                                let newSubscriptionArray = Array.filter<User.Subscribe>(subscriptionArray, func(sub) { 
                                    sub.subscribing.principal_id != targetPrincipal 
                                });
                                
                                let newEndDate = if (existing.end_date > currentTime) {
                                    existing.end_date + monthsInNanoseconds
                                } else {
                                    currentTime + monthsInNanoseconds
                                };

                                let extendedSubscription : User.Subscribe = {
                                    principal_id = subscriberPrincipal;
                                    subscribing = targetUser;
                                    start_date = existing.start_date;
                                    end_date = newEndDate;
                                };

                                let newBuffer = Buffer.Buffer<User.Subscribe>(0);
                                for (sub in newSubscriptionArray.vals()) {
                                    newBuffer.add(sub);
                                };
                                newBuffer.add(extendedSubscription);
                                subscriptionMap.put(subscriberPrincipal, newBuffer);
                                
                                #ok("Subscription extended successfully for " # Nat.toText(months) # " months");
                            };
                            case null {
                                let newSubscription : User.Subscribe = {
                                    principal_id = subscriberPrincipal;
                                    subscribing = targetUser;
                                    start_date = currentTime;
                                    end_date = currentTime + monthsInNanoseconds;
                                };

                                subscriptionList.add(newSubscription);
                                #ok("Successfully subscribed for " # Nat.toText(months) # " months");
                            };
                        };
                    };
                };
            };
        };
    };

    public func getAllSubscriptions(userPrincipal: Text) : async Result.Result<[User.Subscribe], Text> {
        switch(tree.get(userPrincipal)) {
            case null { #err("User not found") };
            case (?_) {
                switch (subscriptionMap.get(userPrincipal)) {
                    case null { #ok([]) };
                    case (?subscriptionList) {
                        #ok(Buffer.toArray(subscriptionList));
                    };
                };
            };
        };
    };

    public func isSubscribed(subscriberPrincipal: Text, targetPrincipal: Text) : async Result.Result<Bool, Text> {
        switch(tree.get(subscriberPrincipal)) {
            case null { #err("Subscriber user not found") };
            case (?_) {
                switch(tree.get(targetPrincipal)) {
                    case null { #err("Target user not found") };
                    case (?_) {
                        switch (subscriptionMap.get(subscriberPrincipal)) {
                            case null { #ok(false) };
                            case (?subscriptionList) {
                                let subscriptionArray = Buffer.toArray(subscriptionList);
                                let currentTime = Time.now();
                                
                                let activeSubscription = Array.find<User.Subscribe>(subscriptionArray, func(sub) { 
                                    sub.subscribing.principal_id == targetPrincipal and sub.end_date > currentTime
                                });
                                
                                switch (activeSubscription) {
                                    case null { #ok(false) };
                                    case (?_) { #ok(true) };
                                };
                            };
                        };
                    };
                };
            };
        };
    };

    public func getSubscriptionDetails(subscriberPrincipal: Text, targetPrincipal: Text) : async Result.Result<User.Subscribe, Text> {
        switch(tree.get(subscriberPrincipal)) {
            case null { #err("Subscriber user not found") };
            case (?_) {
                switch(tree.get(targetPrincipal)) {
                    case null { #err("Target user not found") };
                    case (?_) {
                        switch (subscriptionMap.get(subscriberPrincipal)) {
                            case null { #err("No subscriptions found") };
                            case (?subscriptionList) {
                                let subscriptionArray = Buffer.toArray(subscriptionList);
                                
                                let subscription = Array.find<User.Subscribe>(subscriptionArray, func(sub) { 
                                    sub.subscribing.principal_id == targetPrincipal
                                });
                                
                                switch (subscription) {
                                    case null { #err("Subscription not found") };
                                    case (?sub) { #ok(sub) };
                                };
                            };
                        };
                    };
                };
            };
        };
    };

    public func getSubscribersCount(targetPrincipal: Text) : async Result.Result<Nat, Text> {
        switch(tree.get(targetPrincipal)) {
            case null { #err("User not found") };
            case (?_) {
                var count = 0;
                let currentTime = Time.now();
                
                for ((_, subscriptionList) in subscriptionMap.entries()) {
                    let subscriptionArray = Buffer.toArray(subscriptionList);
                    for (sub in subscriptionArray.vals()) {
                        if (sub.subscribing.principal_id == targetPrincipal and sub.end_date > currentTime) {
                            count += 1;
                        };
                    };
                };
                #ok(count);
            };
        };
    };

    public func unsubscribe(subscriberPrincipal: Text, targetPrincipal: Text) : async Result.Result<Text, Text> {
        switch (subscriptionMap.get(subscriberPrincipal)) {
            case null { #err("User has no subscriptions") };
            case (?subscriptionList) {
                let subscriptionArray = Buffer.toArray(subscriptionList);
                let newSubscriptionArray = Array.filter<User.Subscribe>(subscriptionArray, func(sub) { 
                    sub.subscribing.principal_id != targetPrincipal 
                });
                
                if (subscriptionArray.size() == newSubscriptionArray.size()) {
                    #err("Not subscribed to this user");
                } else {
                    let newBuffer = Buffer.Buffer<User.Subscribe>(0);
                    for (sub in newSubscriptionArray.vals()) {
                        newBuffer.add(sub);
                    };
                    subscriptionMap.put(subscriberPrincipal, newBuffer);
                    #ok("Successfully unsubscribed");
                };
            };
        };
    };
}