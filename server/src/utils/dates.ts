export function monthStringToZeroBasedNumber(month = "") {
  switch (month.toLowerCase()) {
    case "january":
      return 0;
    case "february":
      return 1;
    case "march":
      return 2;
    case "april":
      return 3;
    case "may":
      return 4;
    case "june":
      return 5;
    case "july":
      return 6;
    case "august":
      return 7;
    case "september":
      return 8;
    case "october":
      return 9;
    case "november":
      return 10;
    case "december":
      return 11;
    default:
      return null;
  }
}
