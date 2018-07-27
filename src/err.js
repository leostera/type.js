//     err : String -> Void (throws TypeError)
export default message => {
  throw new TypeError(message);
};
