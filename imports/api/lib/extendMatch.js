import { isValidPhone } from "./validation";

Match.phone = Match.Where(phoneNumber => {
  return isValidPhone(phoneNumber);
});
