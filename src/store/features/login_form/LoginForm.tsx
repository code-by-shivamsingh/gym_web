"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  useTheme,
  Paper,
  Stack,
  Divider,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { motion } from "framer-motion";
import { useFormik } from "formik";
import * as yup from "yup";
import { useRouter } from "next/navigation";

import { useUserProfileContext } from "@/context/user-profile-context";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setFirebaseToken, setUserProfile } from "@/store/features/user_details/userDetailsSlice";
import { loginWithKeycloak } from "@/dialogs/invoice_config/services";

/* ---------------- VALIDATION ---------------- */
// const FormSchemaLogin = yup.object({
//   email: yup
//     .string()
//     .email("Enter a valid email")
//     .required("Email is required"),
//   password: yup
//     .string()
//     .min(5, "Minimum 5 characters")
//     .required("Password is required"),
// });

/* ---------------- ANIMATION ---------------- */
const container = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

const LoginForm = () => {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { login }: any = useUserProfileContext();

  const userId = useAppSelector(
    (state: any) => state?.userDetails?.userProfile?.id
  );

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  /* ---------------- FORM ---------------- */
  const formik = useFormik({
    initialValues: { email: "", password: "" },
    // validationSchema: FormSchemaLogin,
    validateOnBlur: true,

   onSubmit: async (values) => {
  setIsLoading(true);
  setApiError(null);

  try {
    const res = await loginWithKeycloak({
      username: values.email,
      password: values.password,
    });

    console.log("LOGIN RESPONSE:", res);

    // ✅ Handle success properly
    if (res?.success && res?.data?.access_token) {
  const token = res.data.access_token;

  // ✅ save token
  dispatch(setFirebaseToken(token));

  // ✅ save logged in user
  dispatch(setUserProfile(res.data.user));

  // optional context login
  login?.(res.data);

  router.push("/dashboard");
} else {
      // ❌ Invalid credentials case
      setApiError(res?.message || "Invalid email or password");
    }
  } catch (error) {
    console.error(error);
    setApiError("Something went wrong");
  } finally {
    setIsLoading(false);
  }
}
  });

  /* ---------------- REDIRECT IF LOGGED IN ---------------- */
  useEffect(() => {
    if (userId) router.replace("/dashboard");
  }, [userId, router]);

  if (userId) return null;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          theme.palette.mode === "dark"
            ? "radial-gradient(circle, #1e1e2f, #0f0f1a)"
            : "linear-gradient(135deg, #667eea, #764ba2)",
        p: 2,
      }}
    >
      <motion.div initial="hidden" animate="show" variants={container}>
        <Paper
          elevation={10}
          sx={{
            width: 420,
            p: 4,
            borderRadius: 4,
            backdropFilter: "blur(12px)",
            background:
              theme.palette.mode === "dark"
                ? "rgba(20,20,30,0.9)"
                : "rgba(255,255,255,0.95)",
          }}
        >
          {/* HEADER */}
          <motion.div variants={item}>
            <Stack alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 3,
                  background: "linear-gradient(135deg,#667eea,#764ba2)",
                }}
              />
              <Typography variant="h5" fontWeight={700}>
                Tenets Softech
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Welcome back 👋
              </Typography>
            </Stack>
          </motion.div>

          <Divider sx={{ my: 3 }} />

          {/* FORM */}
          <form onSubmit={formik.handleSubmit}>
            <Stack spacing={2}>
              <motion.div variants={item}>
                <TextField
                  label="Email"
                  name="email"
                  fullWidth
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(formik.touched.email && formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </motion.div>

              <motion.div variants={item}>
                <TextField
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(
                    formik.touched.password && formik.errors.password
                  )}
                  helperText={
                    formik.touched.password && formik.errors.password
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </motion.div>

              {apiError && (
                <Typography color="error" textAlign="center">
                  {apiError}
                </Typography>
              )}

              <motion.div variants={item}>
                <LoadingButton
                  type="submit"
                  loading={isLoading}
                  fullWidth
                  variant="contained"
                  sx={{
                    py: 1.3,
                    borderRadius: 2,
                    fontWeight: 600,
                    background: "linear-gradient(90deg,#667eea,#764ba2)",
                  }}
                >
                  Login
                </LoadingButton>
              </motion.div>
            </Stack>
          </form>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default React.memo(LoginForm);