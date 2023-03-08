// example for rooms with single user
// const rooms = {
//   userId1: [
//     { socketId1: ["Desktop", "access"] },
//     { socketId2: ["iPhone", "access"] },
//   ],
// };
export const socketHandler = {
  // check if exist room for userId and add socketId to the room
  join: function (joinDevice, userId, rooms) {
    let join;
    let msg;
    if (userId in rooms) {
      const userConnectedDevice = rooms[userId].length;
      if (userConnectedDevice === 0) {
        join = true;
        if (joinDevice === "Desktop") {
          msg = "成功連線，請接著使用手機登入";
        } else {
          msg = "成功連線，請接著使用電腦登入";
        }
      }
      if (userConnectedDevice === 1) {
        if (joinDevice === "Desktop") {
          if (Object.values(rooms[userId][0])[0].includes("Desktop")) {
            join = false;
            msg = "已有電腦連線，請使用手機登入";
          } else {
            join = true;
            msg = "手機與電腦皆已連線，請取得視訊鏡頭和感測器許可";
          }
        } else {
          if (Object.values(rooms[userId][0])[0].includes("Desktop")) {
            join = true;
            msg = "手機與電腦皆已連線，請取得視訊鏡頭和感測器許可";
          } else {
            join = false;
            msg = "已有手機連線，請使用電腦登入";
          }
        }
      }
    } else {
      join = true;
      if (joinDevice === "Desktop") {
        msg = "成功連線，請接著使用手機登入";
      } else {
        msg = "成功連線，請接著使用電腦登入";
      }
    }
    return { join, msg };
  },
  // add "access" to corresponding socketId
  access: function (userId, socketId, rooms) {
    rooms[userId].forEach((connectedDevice, index) => {
      if (Object.keys(connectedDevice)[0] === socketId) {
        rooms[userId][index][socketId].push("access");
      }
    });
  },
  recordResponse: {
    start: {
      both: { both: true, msg: "裝置已同步開始紀錄" },
      desktop: { both: false, msg: "請取得手機感測器許可" },
      mobile: { both: false, msg: "請取得電腦視訊鏡頭許可" },
    },
    stop: {
      both: {
        both: true,
        msg: "裝置已同步停止紀錄，請填寫動作名稱和次數並送出紀錄",
      },
      desktop: { both: false, msg: "請確認手機感測器許可" },
      mobile: { both: false, msg: "請確認電腦視訊鏡頭許可" },
    },
  },
  // check if both connected device has "access"
  record: function (state, triggerDevice, userId, rooms) {
    let accessCount = 0;
    rooms[userId].forEach((connectedDevice, index) => {
      const key = Object.keys(connectedDevice)[0];
      if (rooms[userId][index][key].includes("access")) {
        accessCount += 1;
      }
    });
    if (accessCount === 2) {
      return this.recordResponse[state].both;
    } else {
      if (triggerDevice === "Desktop") {
        return this.recordResponse[state].desktop;
      } else {
        return this.recordResponse[state].mobile;
      }
    }
  },
  // find corresponding socketId and remove from user's room
  removeDisconnectedDeviceSocketId: function (socketId, rooms) {
    try {
      const BreakException = `${socketId} removed out of rooms`;
      Object.entries(rooms).forEach(([key, value]) => {
        value.forEach((connectedDevice, index) => {
          if (Object.keys(connectedDevice)[0] === socketId) {
            rooms[key].splice(index, 1);
            throw BreakException;
          }
        });
      });
    } catch (err) {
      console.log(err);
    }
  },
};
