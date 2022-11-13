import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { error } from "console";
import { response } from "express";
import { useState } from "react";

const Dashboard = () => {
  const [signedIn, setSignedIn] = useState(false);

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      console.log(codeResponse);
      const { code } = codeResponse;
      axios
        .post("http://localhost:3000/api/create-tokens", { code })
        .then((codeResponse) => {
          setSignedIn(true);
          // console.log("abc", codeResponse.data);
        })
        .catch((error) => console.log(error.message));
    },
    flow: "auth-code",
    scope:
      "email profile openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar",
  });

  const date = new Date();
  const daten = new Date(new Date(date).setFullYear(date.getFullYear() + 1));
  const start = date.toISOString();
  const end = daten.toISOString();

  const handleSubmit = () => {
    axios
      .post("http://localhost:3000/api/get-events", {
        start,
        end,
      })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => console.log(error.message));
  };

  return (
    <div>
      <div>
        <h1>Google Calendar API</h1>
      </div>

      {!signedIn ? (
        <div>
          <button onClick={() => login()}>Sign in with Google 🚀 </button>
        </div>
      ) : (
        <div>
          <button className="ButtonOne" onClick={() => handleSubmit()}>
            See UpcomingEvents
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
