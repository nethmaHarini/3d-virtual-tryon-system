import API_URL from "./config";

const AUTH_KEYS = [
  "token",
  "userId",
  "username",
  "userEmail",
  "profilePhoto",
  "accountStatus",
  "avatar_file",
  "avatarUrl",
  "generatedAvatar",
  "s3AvatarUrl",
  "avatarS3Key",
  "avatarMeasurements",
  "avatar_updated",
  "avatarUpdated",
  "avatarTimestamp",
  "avatar_timestamp",
  "generatedAvatarMeta",
  "avatar_meta",
  "avatarInfo",
  "avatar",
  "firstLoginAt",
  "lastLoginAt",
];

const USER_STATE_KEYS = [
  "notifications",
  "viewHistory",
];

const PROFILE_KEYS = [
  "profilePhoto",
  "accountStatus",
];

const removeKeys = (keys) => {
  keys.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      // Ignore storage access failures.
    }
  });
};

export const clearAuthenticatedSession = () => {
  removeKeys(AUTH_KEYS);
  removeKeys(USER_STATE_KEYS);
};

export const clearProfileSession = () => {
  removeKeys(PROFILE_KEYS);
};

export const storeAuthenticatedSession = ({
  token,
  user,
}) => {
  clearAuthenticatedSession();

  if (token) {
    localStorage.setItem("token", token);
  }

  if (user?.id !== undefined && user?.id !== null) {
    localStorage.setItem("userId", String(user.id));
  }

  if (user?.username) {
    localStorage.setItem("username", user.username);
  }

  if (user?.email) {
    localStorage.setItem("userEmail", user.email);
  }

  if (user?.profile_image_url) {
    localStorage.setItem("profilePhoto", user.profile_image_url);
  } else {
    localStorage.removeItem("profilePhoto");
  }

  if (user?.account_status) {
    localStorage.setItem("accountStatus", user.account_status);
  } else {
    localStorage.removeItem("accountStatus");
  }

  if (user?.first_login_at) {
    localStorage.setItem("firstLoginAt", user.first_login_at);
  }

  if (user?.last_login_at) {
    localStorage.setItem("lastLoginAt", user.last_login_at);
  }
};

export const storeProfileSnapshot = (user) => {
  if (!user) {
    return;
  }

  if (user.username) {
    localStorage.setItem("username", user.username);
  }

  if (user.email) {
    localStorage.setItem("userEmail", user.email);
  }

  if (user.profile_image_url !== undefined) {
    if (user.profile_image_url) {
      localStorage.setItem("profilePhoto", user.profile_image_url);
    } else {
      localStorage.removeItem("profilePhoto");
    }
  }

  if (user.account_status) {
    localStorage.setItem("accountStatus", user.account_status);
  }

  if (user.first_login_at) {
    localStorage.setItem("firstLoginAt", user.first_login_at);
  }

  if (user.last_login_at) {
    localStorage.setItem("lastLoginAt", user.last_login_at);
  }
};

export const getStoredSessionSnapshot = () => ({
  token: localStorage.getItem("token") || "",
  userId: localStorage.getItem("userId") || "",
  username: localStorage.getItem("username") || "",
  email: localStorage.getItem("userEmail") || "",
  profilePhoto: localStorage.getItem("profilePhoto") || "",
  accountStatus: localStorage.getItem("accountStatus") || "",
});

export const syncAuthenticatedSession = async ({ signal } = {}) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  const response = await fetch(`${API_URL}/profile/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error("Failed to load authenticated user profile");
  }

  const data = await response.json();

  if (localStorage.getItem("token") !== token) {
    return null;
  }

  storeProfileSnapshot(data.user);

  return data.user;
};
