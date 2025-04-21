const User=require('../models/user.model');
const OTP=require('../models/otp.model')
const otpGenerator=require('otp-generator')

const generateJwtToken = async (userId) => {
    try {
      const user = await User.findOne({ _id: userId });
      const jwtToken = await user.generateToken();
      //  console.log(jwtToken);
      // user.token=jwtToken;
      // await user.save({validateBeforeSave:false});
      return jwtToken;
    } catch (error) {
      console.log(error.message);
    }
  };

exports.sendOTP = async (req, res) => {
    try {
      const { email } = req.body;
  
      // Check if the user exists
      let user = await User.findOne({ email })
  
      if (user && user.isVerified) {
        return res.status(400).json({
          success: false,
          message: "User is already verified",
        });
      }
      const otp = otpGenerator.generate(4, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
      });
      const newOTP = await OTP.create({
        otp: otp,
        email: email,
      });
      return res.status(200).json({
        success: true,
        message: "OTP sent successfully",
      });
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error in generating OTP",
        error: error.message,
      });
    }
  };


exports.verifyOtp = async (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: "Otp and email is required to verify user"
        })
      }
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      const verifyOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });
      if (!verifyOtp) {
        return res.status(400).json({
          success: false,
          message: "Otp not found for userAccount",
        });
      }
      if (otp !== verifyOtp.otp) {
        return res.status(400).json({
          success: false,
          message: "Invalid otp",
        });
      }
      user.isVerified = true;
      await user.save();
      return res.status(200).json({
        success: true,
        message: 'User verified successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error in verifying otp!',
        error: error.message,
      });
    }
  }

  exports.registerUser = async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      const schema = validationSchemaForUser(["name", "email", "password"]);
      await schema.validateAsync(req.body);
      // the lean() method is used to return documents from queries as plain JavaScript objects  instead of Mongoose documents, making queries faster and less memory intensive.
      // By default, Mongoose queries return instances of the Mongoose Document class, which are heavier due to internal state for change tracking. Enabling the lean option skips the instantiation of a full Mongoose document and returns a plain JavaScript objects
      //  lean should be use in read only cases
      const registeredUser = await User.findOne({ email }).lean();
      if (registeredUser) {
        // if user is registered already and he is sending profile image then the file needs to be removed locally
        const profileImageLocalPath = req.files?.profileImage[0]?.path;
        removeLocalFile(profileImageLocalPath);
        return res.status(409).json({
          success: false,
          message: "Email already registered.",
        });
  
      }
      const newUser = await User.create({
        name,
        email,
        password,
      });
  
      const createdUser = await User.findById(newUser._id).select("-password");
  
      return res.status(201).json({
        success: true,
        message: "User registered successfully.",
        data: createdUser,
      });
    } catch (error) {
      const errorMessage = error.isJoi
        ? error.details[0]?.message
        : "Server error in signup";
      let statusCode = error.isJoi ? 422 : 500;
      // console.log(statusCode);
      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: error.message,
      });
    }
  };
  
  exports.loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(401).json({
          success: false,
          message: "Please fill all the fields if you want to login",
        });
      }
      const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      const isPasswordCorrect = await user.isPasswordCorrect(password);
      if (!isPasswordCorrect) {
        return res.status(401).json({
          success: false,
          message: "Can't login, Incorrect password",
        });
      }
      if (!user.isVerified) {
        return res.status(403).json({
          success: false,
          message: 'User account not verified',
          redirectTo: 'verify-otp'
        })
      }
      // console.log(user._id);
      const token = await generateJwtToken(user._id);
      // console.log(token)
      const loggedInUser = await User.findById(user.id).select(
        "-password -token"
      );
      // console.log(loggedInUser);
      const options = {
        httpOnly: true,
        secure: true,
      };
      if (!loggedInUser) {
        return res.status(401).json({
          success: false,
          message: "User can't found login",
        });
      }
      return res
        .status(200)
        .cookie("token", token, {
          ...options,
          expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        })
        .json({
          success: true,
          message: "User logged in successfully",
          data: { loggedInUser, token },
        });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error while signing in user.",
        error: error.message,
      });
    }
  };
  exports.logoutUser = async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findByIdAndUpdate(userId, {
        $set: {
          token: undefined,
        },
      });
      const options = {
        httpOnly: true,
        secure: true,
      };
      return res
        .status(200)
        .clearCookie("token", options)
        .json({
          success: true,
          message: `${user.name} logged Out`,
        });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error while signout.",
        error: error.message,
      });
    }
  };
  