module {
    public type User = {
        principal_id : Text;
        username : Text;
        profile_picture : Text;
        created_at : Int;
        streaming_key: Text;
        bio : ?Text;
    };

    public type Following = {
       principal_id : Text;
       following : User; 
    };

    public type Followers = {
       principal_id : Text;
       followers : User; 
    };

    public type Subscribe = {
        principal_id : Text;
        subscribing: User;
        start_date : Int;
        end_date: Int;
    }
}