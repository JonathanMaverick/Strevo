import User "types";
import RBTree "mo:base/RBTree";
import Text "mo:base/Text";
import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";
import Time "mo:base/Time"

persistent actor Main {
    transient let tree = RBTree.RBTree<Text, User.User>(Text.compare);
    transient var followingMap = HashMap.HashMap<Text, Buffer.Buffer<User.User>>(0, Text.equal, Text.hash);
    
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

}