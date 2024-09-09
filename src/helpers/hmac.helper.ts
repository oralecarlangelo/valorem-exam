import * as crypto from "crypto";
import { HMAC } from "../constants/constants";

export const verifyHMAC = (req: any): boolean => {
  const hmacHeader = req.headers.authorization;
  if (!hmacHeader) {
    return false;
  }

  const [algorithm, hmacValue] = hmacHeader.split(" ");
  if (algorithm !== HMAC.ALGORITHM) {
    return false;
  }

  const bodyString = JSON.stringify(req.body);
  const calculatedHMAC = crypto
    .createHmac("sha256", HMAC.SECRET)
    .update(bodyString)
    .digest("hex");
  console.log("calculatedHMAC", calculatedHMAC);
  return calculatedHMAC === hmacValue;
};
