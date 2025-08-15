import { useParams } from 'react-router-dom';
import { useUserProfile } from '../services/userProfileService';
import { useEffect } from 'react';

function Profiles() {
  const { principalId } = useParams();
  const { user, stats, followingList, followersList, loadProfile, isOwnProfile } =
  useUserProfile(principalId);

  useEffect(() => {
    if (principalId) {
      loadProfile(principalId);
    }
  }, []);

  console.log(stats);
  console.log(user);
  console.log(followingList);
  console.log(followersList)
  console.log(isOwnProfile);

  return (
    <div>
      <h1>Profile Page</h1>
      <p>Principal ID: {principalId}</p>
      <p>User : {user?.username}</p>
    </div>
  );
}

export default Profiles;
