function login(user) {
  console.log("HERE")
  const username = user.name.toLowerCase();
  console.log("HERE2")
  return username === "raj";
  console.log("WHY THIS IS NOT RUNNING!!")
}

console.log(login(undefined));