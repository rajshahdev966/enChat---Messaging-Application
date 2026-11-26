import { authenticatedRequest } from "../../auth/api/auth.api";

const buildQueryString = (values = {}) => {
  const entries = Object.entries(values).filter(
    ([, value]) => value !== undefined && value !== null && value !== ""
  );
  return new URLSearchParams(entries).toString();
};

const extractData = (response) => response.data;

export const discoverPeopleRequest = (values, accessToken, signal) =>
  authenticatedRequest(`/user/discover?${buildQueryString(values)}`, accessToken, { signal }).then(
    extractData
  );

export const getPersonProfileRequest = (userId, accessToken, signal) =>
  authenticatedRequest(
    `/user/${encodeURIComponent(userId)}/profile`,
    accessToken,
    { signal }
  ).then(extractData);