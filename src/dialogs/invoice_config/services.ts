import { URL_AUTH_FORGOT_PASSWORD, URL_AUTH_LOGIN, URL_AUTH_RESET_PASSWORD, URL_MEMBERS } from "@/src/constants/apis";

interface LoginParams {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
}

export const loginUser = async (
  params: LoginParams
): Promise<LoginResponse> => {
  try {
    const response = await fetch(URL_AUTH_LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: params.email,
        password: params.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message:
          data?.message || "Login failed",
      };
    }

    return {
      success: true,
      message: data.message,
      token: data.token,
    };
  } catch (error) {
    console.error(
      "Login API Error:",
      error
    );

    return {
      success: false,
      message:
        "Unable to connect to server. Please try again.",
    };
  }
};


export const getAllMembers = async () => {
  try {
    const response = await fetch(URL_MEMBERS);

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Get Members Error:", error);
    throw error;
  }
};


export const createMember = async (data: any) => {
  const res = await fetch(`${URL_MEMBERS}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

export const getMembers = async () => {
  const response = await fetch(URL_MEMBERS);

  return response.json();
};

export const deleteMember = async (id: string) => {
  const response = await fetch(
    `${URL_MEMBERS}/${id}`,
    {
      method: "DELETE",
    }
  );

  return response.json();
};


export const updateMember = async (
  id: string,
  data: any
) => {
  const response = await fetch(
    `${URL_MEMBERS}/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  return await response.json();
};
export const forgotPassword = async (
  email: string
) => {
  const response = await fetch(
    URL_AUTH_FORGOT_PASSWORD,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    }
  );

  return await response.json();
};

export const resetPassword = async (
  token: string,
  password: string
) => {
  const response = await fetch(
    `${URL_AUTH_RESET_PASSWORD}/${token}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    }
  );

  return await response.json();
};