module.exports = [
  {
    url: "/?testGet",
    method: "GET",
    controller: require(__dirname + "/mockAPIs/testGet")
  },
  {
    url: "/?testPost",
    method: "POST",
    controller: require(__dirname + "/mockAPIs/testPost")
  },
  {
    url: "/?create",
    method: "GET",
    controller: require(__dirname + "/mockAPIs/create")
  }
];