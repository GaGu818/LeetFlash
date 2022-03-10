import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./options.css";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import {
  setStoredUser,
  getStoredUser,
  User,
  getStoredOnlyVisitor,
  setStoredOnlyVisitor,
  clearTodayPerformance,
  DefaultUserPerformance,
  DefaultUser,
} from "../utils/storage";
import { ToastContainer, toast } from "material-react-toastify";
import "material-react-toastify/dist/ReactToastify.css";
import Switch from "@mui/material/Switch";
import Link from "@mui/material/Link";
import ClearAlert from "./ClearAlert";
import { verifyUser } from "../utils/api";
type FormState = "ready" | "saving";
const App: React.FC<{}> = () => {
  const [user, setUser] = useState<User>(DefaultUser);
  const [formState, setFormState] = useState<FormState>("ready");
  const [onlyVisitor, setOnlyVisitor] = useState<boolean>(false);
  const [signIn, setSignIn] = useState<boolean>(false);
  const [openAlert, setOpenAlert] = useState<boolean>(false);
  useEffect(() => {
    getStoredUser().then((user) => {
      console.log("Get user ");
      console.log(user);

      setUser(user);
      if (!user.uuid) {
        getStoredOnlyVisitor().then((onlyVisitor) => {
          setOnlyVisitor(onlyVisitor);
        });
        setSignIn(false);
      } else {
        setSignIn(true);
      }
      console.log(user);
    });
  }, []);

  const submitHandler = () => {
    setFormState("saving");
    toast.info("Saving your info...");

    verifyUser(user.uuid)
      .then((returnUser: User) => {
        setUser(returnUser);
        setStoredUser(returnUser).then(() => {
          setTimeout(() => {
            setFormState("ready");
            toast.success(
              "Successfully linked the extension with your account!"
            );
            setSignIn(true);
          }, 1000);
        });
      })
      .catch((status: number) => {
        if (status == 401) {
          toast.error(
            "Cannot link your account with LeetFlash. Please check if the credential is valid. "
          );
          setTimeout(() => {
            setFormState("ready");
          }, 1000);
        } else {
          toast.error(
            "Cannot connect to the server, use Only Extension mode first"
          );
          setFormState("ready");
        }
      });
  };

  const handleOnlyVisitorChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setOnlyVisitor(event.target.checked);
    setStoredOnlyVisitor(event.target.checked);
    toast.success("Only Visitor mode is now: " + event.target.checked);
  };

  const signoutUserHandler = () => {
    setStoredUser(DefaultUser);
    setUser(DefaultUser);
    setSignIn(false);
    toast.success("Successfully signed out!");
  };

  const handleClear = (clear: boolean) => {
    if (clear) {
      clearTodayPerformance();
      toast.success("Cleared your history for today !");
    }
    setOpenAlert(false);
  };

  if (!user) {
    return null;
  }

  // const handleAutoOverlayChange = (hasAutoOverlay: boolean) => {
  //   setOptions({ ...options, hasAutoOverlay });
  // };
  const isFieldsDisabled = formState === "saving";
  return (
    <Grid
      container
      item
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center"
    >
      <Grid item>
        <Paper sx={{ px: 10, py: 5 }}>
          <Typography variant="h2" pb={5}>
            Setting
          </Typography>

          <Link
            href="#"
            underline="hover"
            onClick={() => {
              setOpenAlert(true);
            }}
            sx={{ display: "block", mb: 2 }}
          >
            Clear Today History
          </Link>

          <Typography variant="body2">
            App is still developing, so feel free to use Only Extension option
            :)
          </Typography>

          <Grid container direction="column">
            <Grid
              item
              py={5}
              container
              direction="row"
              justifyContent="space-between"
              alignItems="flex-end"
            >
              <Grid item>
                <Typography variant="h6">LeetFlash Token</Typography>
              </Grid>
              <Grid item>
                <TextField
                  label="User "
                  value={user.uuid}
                  variant="standard"
                  onChange={(e) => setUser({ ...user, uuid: e.target.value })}
                  disabled={isFieldsDisabled || onlyVisitor}
                />
              </Grid>
            </Grid>
            <Grid
              item
              py={5}
              container
              direction="row"
              justifyContent="space-between"
              alignItems="flex-end"
            >
              <Grid item>
                <Typography variant="h6">Only Extension</Typography>
              </Grid>
              <Grid item sx={{ pr: 10 }}>
                <Switch
                  disabled={isFieldsDisabled || signIn}
                  checked={onlyVisitor || false}
                  onChange={handleOnlyVisitorChange}
                />
              </Grid>
            </Grid>
            <Grid item>
              <Typography variant="body2">
                *Only Extension: only use extension functionality without
                signin.
              </Typography>

              <Typography variant="body2" sx={{ pb: 2 }}>
                *If you signed in, this field will be ignored.
              </Typography>

              <Typography variant="body2"></Typography>

              <Link
                component="button"
                disabled
                // href="http://localhost:300/user/sign-up"
                target="_blank"
                rel="noopener"
                underline="hover"
              >
                No Account? Sign up
              </Link>
              <div></div>
              <Link
                href="#"
                underline="hover"
                onClick={signoutUserHandler}
                sx={{ display: !signIn ? "none" : "inline" }}
              >
                Sign out
              </Link>
            </Grid>
            <Grid container item justifyContent="center" sx={{ pt: 5 }}>
              <Button
                disabled={isFieldsDisabled}
                variant="contained"
                size="medium"
                onClick={submitHandler}
              >
                {formState === "saving" ? "Saving..." : "Save"}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      <ToastContainer />
      <ClearAlert AlertOpen={openAlert} handleClear={handleClear} />
    </Grid>
  );
};

const root = document.createElement("div");
document.body.appendChild(root);
ReactDOM.render(<App />, root);
