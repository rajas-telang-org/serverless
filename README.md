# serverless
Assignment Submission Lambda Function

This Lambda function streamlines the submission process for assignments, seamlessly integrating various cloud services and APIs. Below is a comprehensive guide detailing its components, functionalities, and setup instructions for seamless deployment:

Components:
Google Cloud Storage Integration: Leveraging the @google-cloud/storage library, this function interacts with Google Cloud Storage to efficiently manage assignment submissions within designated buckets.

AWS Secrets Manager: To ensure the secure handling of sensitive credentials required for accessing Google Cloud Storage, this function employs AWS Secrets Manager for storage and management.

Mailgun Integration: Integrating with Mailgun, a transactional email service, this function sends informative email notifications to users regarding the status of their assignment submissions.

AWS DynamoDB: Utilizing DynamoDB, an AWS NoSQL database service, this function maintains comprehensive records of submission details, including user email, file location, and submission status.

External Libraries: The function incorporates essential external libraries such as node-fetch, axios, aws-sdk, among others, to facilitate HTTP requests, AWS SDK operations, and other critical functionalities.

Functionality:
Event Handling: Triggered by events, typically originating from an SNS topic, this function efficiently handles new assignment submission notifications.

Data Extraction: It meticulously extracts pertinent information from the event message, including the submission URL and user email, ensuring accurate processing.

Google Cloud Storage Configuration: Securely retrieving credentials from AWS Secrets Manager, the function configures the Google Cloud Storage client, enabling seamless interaction with the designated storage bucket.

Download and Storage: Upon receipt, the function promptly downloads the submitted assignment from the provided URL and securely stores it within the specified Google Cloud Storage bucket.

Email Notification: Post successful submission, the function promptly dispatches an email confirmation to the user via Mailgun, affirming the successful receipt and verification of the submission.

Error Handling: In the event of any operational errors during the submission process, the function diligently notifies the user via email and updates the submission status accordingly within DynamoDB for comprehensive tracking and management.

Setup:
Environment Configuration: Ensure all requisite environment variables, such as Email_API, MAIL_DOMAIN, GoogleBucket_Name, SECRET_ARN, tableName, and project_id, are accurately configured within the Lambda environment.

AWS IAM Permissions: Grant the Lambda function appropriate permissions to seamlessly interact with AWS services, including Secrets Manager, DynamoDB, and to execute requisite operations.

Google Cloud Storage Setup: Ensure the designated Google Cloud Storage bucket is appropriately configured with requisite permissions to facilitate seamless object storage operations.

Mailgun Setup: Establish a Mailgun account and meticulously configure domain settings to enable seamless email dispatch for user notifications.

Lambda Function Deployment: Deploy the Lambda function using the provided codebase and meticulously configure event sources, such as SNS topics, to accurately trigger the function in response to new assignment submissions.

Testing: Conduct thorough testing of the function with sample submissions to validate its functionality, including seamless execution and robust error handling mechanisms.

By adhering to these meticulously outlined steps, you can effectively deploy and utilize this Lambda function to streamline assignment submission processes, ensuring optimal efficiency and user satisfaction.
