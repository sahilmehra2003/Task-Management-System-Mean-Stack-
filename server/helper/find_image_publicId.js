exports.extractImagePublicId=async(imageUrl)=>{
    if (!imageUrl || typeof imageUrl !== 'string') {
        return null;
    }
    const regex = /\/v\d+\/(.+)\.[^.]+$/;
    const match = imageUrl.match(regex);

    // If the regex matched, the public ID (with folder) is in the first capture group
  if (match && match[1]) {
    return match[1];
  }
  console.warn(`Could not extract public ID from Cloudinary URL: ${imageUrl}`);
  return null;
}