import { getCookie, getXsrf } from "../config";

export default function prepareRequest()
{
  getXsrf();
  const token = getCookie("XSRF-TOKEN");
  return token;
}