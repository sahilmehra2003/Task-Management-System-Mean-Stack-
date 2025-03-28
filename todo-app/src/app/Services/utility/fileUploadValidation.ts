export const fileValidation = (file:File | null) => {
    if (!file) {
        alert("File not found. Please try again.");
        return false;
    }

    const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        alert("Invalid file type. Please upload a PNG, JPEG, JPG, or WEBP image.");
        return false;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        alert("File size exceeds 5MB. Please choose a smaller file.");
        return false;
    }

    return true;  
};
