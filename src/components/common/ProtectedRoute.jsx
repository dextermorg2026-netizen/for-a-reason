import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
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

  // User is authenticated, render the protected content
  return children;
};

export default ProtectedRoute;