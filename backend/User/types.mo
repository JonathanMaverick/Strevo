module {
    public type User = {
        principal_id : Text;
        username : Text;
        profile_picture : Text;
        created_at : Int 
    };

    public type Following = {
       principal_id : Text;
       following : User; 
    }
}