import emailjs from "@emailjs/browser"

// Initialize EmailJS with your public key
emailjs.init("NpytlYgOex3URxtmB")

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const sendOTPEmail = async (email: string, otp: string, userName = "User") => {
  try {
    console.log("Sending OTP to:", email)
    console.log("Generated OTP:", otp)

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format")
    }

    // Multiple parameter formats to ensure compatibility
    const templateParams = {
      // Primary fields
      to_email: email,
      to_name: userName,
      otp_code: otp,
      from_name: "Machine Hour Rate Calculator",
      
      // Alternative field names (in case template uses different variables)
      user_email: email,
      recipient_email: email,
      email: email,
      name: userName,
      user_name: userName,
      recipient_name: userName,
      code: otp,
      verification_code: otp,
      
      // Additional fields
      reply_to: email,
      message: `Your verification code is: ${otp}`,
      subject: "Your OTP Code - Machine Hour Rate Calculator"
    }

    console.log("Template parameters:", templateParams)

    // Try sending with emailjs.send
    const response = await emailjs.send(
      "service_s7efo4q", 
      "template_4h6ys46", 
      templateParams
    )

    console.log("EmailJS response:", response)

    if (response.status === 200) {
      console.log("OTP email sent successfully")
      return true
    } else {
      throw new Error(`EmailJS returned status: ${response.status}, text: ${response.text}`)
    }

  } catch (error: any) {
    console.error("EmailJS Error Details:", error)

    // Enhanced error handling
    let errorMessage = "Failed to send OTP email"

    if (error && typeof error === 'object') {
      if (error.text) {
        errorMessage = error.text
      } else if (error.message) {
        errorMessage = error.message
      } else if (error.status) {
        errorMessage = `EmailJS Error: Status ${error.status}`
      } else {
        errorMessage = JSON.stringify(error)
      }
    } else if (typeof error === 'string') {
      errorMessage = error
    }

    console.error("Final error message:", errorMessage)
    throw new Error(errorMessage)
  }
}

// Alternative method using emailjs.sendForm (if the above doesn't work)
export const sendOTPEmailAlternative = async (email: string, otp: string, userName = "User") => {
  try {
    // Create a temporary form element
    const form = document.createElement('form')
    form.style.display = 'none'
    
    // Add form fields
    const fields = {
      to_email: email,
      to_name: userName,
      otp_code: otp,
      from_name: "Machine Hour Rate Calculator",
      user_email: email,
      recipient_email: email
    }

    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = value
      form.appendChild(input)
    })

    document.body.appendChild(form)

    const response = await emailjs.sendForm(
      "service_t8tsvi8",
      "template_g0k8tsq", 
      form
    )

    document.body.removeChild(form)

    return response.status === 200
  } catch (error) {
    console.error("Alternative method failed:", error)
    throw error
  }
}

export const validateOTP = (enteredOTP: string, generatedOTP: string): boolean => {
  return enteredOTP === generatedOTP
}
