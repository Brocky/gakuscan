# Why You Need a Google Cloud Vision API Key for GakuScan

## Overview
GakuScan leverages cutting-edge Optical Character Recognition (OCR) technology to analyze and extract text from various media, such as manga and video games. To provide the best possible user experience, the app currently relies on the **Google Cloud Vision API**, which has consistently demonstrated superior accuracy and performance during testing. Here's why obtaining a Google Cloud Vision API key is essential:

## Superior OCR Results
Through rigorous testing, the **Google Cloud Vision API** has proven to outperform other OCR solutions in terms of:
- **Flexibility**: Handles a wide range of media formats like manga and in-game text, ensuring consistent performance.
- **Speed**: Rapid processing for a seamless user experience.

While alternatives like **Tesseract OCR** exist, they require significant configuration and optimization to approach similar levels of accuracy. It is planned to integrate Tesseract as an option in the future, but it needs further development before it can match the usability of Google Cloud Vision.

## Cost Effectiveness
Google Cloud Vision is not only high-performing but also economical for most users:
- **Free Tier**: The first **1000 requests per month** are free of charge, allowing most casual users to use GakuScan without incurring any costs.
- **Affordable Pricing**: For users exceeding the free tier, the charges are modest, making it a cost-effective choice even for frequent use.

## Future Improvements
While Google Cloud Vision currently provides the best results, the app's roadmap includes:
- **Integration of Tesseract OCR**: As an open-source alternative, Tesseract will be offered in future versions of GakuScan. However, this feature is still under development to improve its accuracy and usability.
- **User Choice**: Once available, you will have the option to choose between Google Cloud Vision and Tesseract, balancing performance and cost based on your preferences.

## Steps to Obtain a Google Cloud Vision API Key
1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Enable the **Google Cloud Vision API** for your project.
4. Set up billing (you won't be charged unless you exceed the free tier).
5. **Set up a Budget**: Define a budget in the Google Cloud Console to monitor usage and avoid unexpected costs. You can configure alerts to notify you when usage approaches your budget limit.
6. Generate and copy your API key.
7. Enter the API key into GakuScan's settings.

## Conclusion
By using the Google Cloud Vision API, GakuScan ensures the best OCR experience across diverse media. With a generous free tier and minimal costs beyond that, it's an accessible solution for most users. As the app improves, additional OCR options will become available, giving you more flexibility and control.

Thank you for choosing GakuScan!
