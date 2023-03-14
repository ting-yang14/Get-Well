# 漸健康復 Get Well

<p>漸健康復 Get Well is a platform for home-based rehabilitation exercises that allows users to record exercise videos and track acceleration and rotation angles. This helps users evaluate their recovery status and create a long-term tracking system for their practice.<p/>

🔗&nbsp;&nbsp;**Project link:** https://www.ting-yang14.com/
<br/>
| Test Info | Value |
| ------------- | ------------- |
| email | testUser@gmail.com |
| password | testUser1! |

</br>
<img src = "./image/readme_demo.gif" width="500"/>
<br/>

## Table Content

- [Main Feature](#main-feature)
- [Backend Technique](#backend-technique)
- [Frontend Technique](#frontend-technique)
- [Backend Architecture](#backend-architecture)
- [Socket Architecture](#socket-architecture)
- [Database Design](#database-design)
- [API Document](#api-document)
- [Real World Testing](#real-world-testing)
- [Contact](#contact)

## Main Feature

- Use **Socket.IO** to synchronize recording control between desktop and mobile
- Use **MediaStream Recording API** to record user motion video
- Use **DeviceMotionEvent API** to record mobile acceleration
- Use **DeviceOrientationEvent API** to record mobile orientation
- **MVC** Pattern
  <br/>

## Backend Technique

- Deployment
  - Docker
- Environment
  - Node.js / Express.js
- Database
  - MongoDB Atlas
- AWS Cloud Service
  - EC2
  - S3
  - CloudFront
- Network
  - HTTP & HTTPS
  - Domain Name System (DNS)
  - NGINX
  - SSL (ZeroSSL)
- Third Party Library
  - Socket.IO
  - Passport.js (JWT strategy)
  - joi.js
    <br/>

## Frontend Technique

- HTML / CSS / JavaScript
- Third Party Library
  - EJS template
  - Bootstrap 5
  - Axios
  - Chart.js
    <br/>

## Backend Architecture

<img src="./image/backend_architecture.png" width="500"/>
<br/>

## Socket Architecture

<img src="./image/socket_diagram.png" width="500"/>
<br/>

## Database Design

<img src="./image/db_diagram.png" width="500"/>
<br/>

## API Document

🔗&nbsp;&nbsp;**Document link:** https://app.swaggerhub.com/apis-docs/ting-yang14/Get-Well/1.0.1

## Real World Testing

- Finger walk
  - the maximum value of &alpha; angle changes depending on the height user's finger climb on the wall
  <table>
      <tr>
          <td><b>150cm to 180cm</b></td>
          <td><b>150cm to 200cm</b></td>
      </tr>
      <tr>
          <td><img src="./image/finger_walk_180.png" width="250" /></td>
          <td> <img src="./image/finger_walk_200.png " width="250" /></td>
      </tr>
      <tr>
          <td><img src="./image/finger_walk_180_result.png" width="250" /></td>
          <td><img src="./image/finger_walk_200_result.png" width="250" /></td>
      </tr>
  </table>
  <br/>
- Pendulum stretch
  - the maximum and minimum value of the x and z axis of acceleration changes depending on the angle between user's arm and central axis during the pendulum stretch
  <table>
      <tr>
          <td><b>small angle</b></td>
          <td><b>large angle</b></td>
      </tr>
      <tr>
          <td><img src="./image/pendulum_small.png" width="250" /></td>
          <td> <img src="./image/pendulum_big.png " width="250" /></td>
      </tr>
      <tr>
          <td><img src="./image/pendulum_small_result.png" width="250" /></td>
          <td><img src="./image/pendulum_big_result.png" width="250" /></td>
      </tr>
  </table>

## Contact

👨‍💻 盧廷洋 Ting-Yang, Lu

📫 Email: tingyang.lu.14@gmail.com
