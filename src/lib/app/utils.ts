/**
 *  given a list of strings and a name, will find the next unique name sequence if the given name
 *  has duplicates.
 *
 *  Note that the `name` has to not have a suffix already.
 */
export function getNextNameSuffix(arr: string[], name: string) {
  const regex = new RegExp("^" + name + "-?((?<=-)\\d+)?$");

  // we want to add "name" here in case name also has a suffix
  const n = arr.reduce((greatest: null | number, item) => {
    const matches = item.match(regex);
    let base = matches?.[0];
    let suffix = matches?.[1];

    // found a duplicate
    if (base) {
      let increment = !suffix ? 2 : parseInt(suffix) + 1;
      return greatest === null ? increment : greatest < increment ? increment : greatest;
    }

    return greatest;
  }, null);

  return n ? `${name}-${n}` : name;
}
