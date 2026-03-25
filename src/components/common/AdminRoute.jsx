import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { currentUser, userProfile } = useAuth();
  const location = useLocation();

  // If the user is not logged in, send them to login
  if (!currentUser) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname || "/" }}
      />
    );
  }

  // If user is authenticated but not an admin, send them to dashboard
  if (userProfile?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // User is authenticated and an admin, render the protected content
  return children;
};

export default AdminRoute;
