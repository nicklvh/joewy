const isPromise = (value: any) => {
  return (
    value instanceof Promise &&
    typeof value.then === "function" &&
    typeof value.catch === "function"
  );
};

const type = (value: any) => {
  const type = typeof value;
  switch (type) {
    case "object":
      return value === null
        ? "null"
        : value.constructor
        ? value.constructor.name
        : "any";
    case "function":
      return `${value.constructor.name}(${value.length})`;
    case "undefined":
      return "void";
    default:
      return type;
  }
};

const removeSensitiveInformation = (data: string) => {
  const blacklist = [process.env.TOKEN];

  return data.replace(new RegExp(blacklist.join("|"), "gi"), "[redacted]");
};
