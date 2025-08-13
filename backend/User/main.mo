import User "types";
import RBTree "mo:base/RBTree";
import Text "mo:base/Text";
import Result "mo:base/Result";

actor Main {
    let tree = RBTree.RBTree<Text, User.User>(Text.compare);
    
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
                tree.put(principal_id, userData);
                #ok(userData)
            };
            case (?_) {
                #err("User already exists")
            };
        }
    };
    
    public func login(principal_id: Text) : async Result.Result<User.User, Text> {
        await getUser(principal_id)
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
}