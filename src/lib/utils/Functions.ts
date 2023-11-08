export function trimArray(array: Array<any>) {
  if (array.length > 10) {
    const length = array.length - 10;
    array = array.splice(0, 10);
    array.push(`${length} more...`);
  }
  return array;
}
