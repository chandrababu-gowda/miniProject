function uploadImage(req, res) {
  console.log(req.body);
  console.log(req.file);
  res.json({ message: "File received" });
}

export { uploadImage };
