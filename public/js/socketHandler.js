export const socketHandler = {
  join: function (joinDevice, userId, rooms) {
    let join;
    let msg;
    // rooms = {"userId1":[{"socketId1":["Desktop"]},{"socketId2":["iPhone"]}],...}
    if (userId in rooms) {
      // userId 已建立過 room
      const userConnectedDevice = rooms[userId].length;
      if (userConnectedDevice === 0) {
        // rooms = {"userId1":[],...}，裝置皆已移除
        join = true;
        if (joinDevice === "Desktop") {
          msg = "成功連線，請接著使用手機登入";
        } else {
          msg = "成功連線，請接著使用電腦登入";
        }
      }
      if (rooms[userId].length === 1) {
        // rooms = {"userId1":[{"socketId1":["Desktop"]}],...}，已有 1 裝置連接
        if (joinDevice === "Desktop") {
          if (Object.values(rooms[userId][0])[0].includes("Desktop")) {
            // joinDevice 為 Desktop, 已連接的裝置為 Desktop
            join = false;
            msg = "已有電腦連線，請使用手機登入";
          } else {
            // joinDevice 為 Desktop, 已連接的裝置為 iPhone 或 Android
            join = true;
            msg = "手機與電腦皆已連線，請取得視訊鏡頭和感測器許可";
          }
        } else {
          if (Object.values(rooms[userId][0])[0].includes("Desktop")) {
            // joinDevice 為 iPhone 或 Android, 已連接的裝置為 Desktop
            join = true;
            msg = "手機與電腦皆已連線，請取得視訊鏡頭和感測器許可";
          } else {
            // joinDevice 為 iPhone 或 Android, 已連接的裝置為 iPhone 或 Android
            join = false;
            msg = "已有手機連線，請使用電腦登入";
          }
        }
      }
      if (userConnectedDevice >= 2) {
        // rooms = {"userId1":[{"socketId1":["Desktop"]},{"socketId2":["iPhone"]}],...}，已有 2 裝置連接
        // 理論上 userConnectedDevice 最大為 2，因為同平台其餘裝置被拒絕
        join = false;
        msg = "此裝置已取得連線，請關閉此分頁";
      }
    } else {
      // 無此使用者的 room，可加入建立 rooms = {"userId":[{"socketId":["joinDevice"]}]}
      join = true;
      if (joinDevice === "Desktop") {
        msg = "成功連線，請接著使用手機登入";
      } else {
        msg = "成功連線，請接著使用電腦登入";
      }
    }
    return { join, msg };
  },
  access: function (userId, socketId, rooms) {
    // 取得許可，搜尋 userId 的 room，在對應 socketId 加入 "access"
    rooms[userId].forEach((connectedDevice, index) => {
      // rooms[userId] = [{ socketId1: ["Desktop"] }, { socketId2: ["iPhone"] }]
      if (Object.keys(connectedDevice)[0] === socketId) {
        rooms[userId][index][socketId].push("access");
      }
    });
    // rooms[userId] = [{ socketId1: ["Desktop", "access"] }, { socketId2: ["iPhone"] }]
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
  record: function (state, triggerDevice, userId, rooms) {
    let accessCount = 0;
    // rooms[userId] = [{ socketId1: ["Desktop", "access"] }, { socketId2: ["iPhone"] }]
    rooms[userId].forEach((connectedDevice, index) => {
      const key = Object.keys(connectedDevice)[0];
      if (rooms[userId][index][key].includes("access")) {
        accessCount += 1;
      }
    });
    // check connected device "access" 的數量是否為 2
    if (accessCount === 2) {
      return this.recordResponse[state].both;
    } else {
      // accessCount == 1，對 startDevice 給失敗訊息
      if (triggerDevice === "Desktop") {
        return this.recordResponse[state].desktop;
      } else {
        return this.recordResponse[state].mobile;
      }
    }
  },
  removeDisconnectedDeviceSocketId: function (socketId, rooms) {
    try {
      const BreakException = `${socketId} removed out of rooms`;
      // rooms = {"userId1":[{"socketId1":["Desktop"]},{"socketId2":["iPhone"]}],...}
      Object.entries(rooms).forEach(([key, value]) => {
        // key: "userId1"
        // value: [{"socketId1":["Desktop","access"]},{"socketId2":["iPhone","access"]}]
        value.forEach((connectedDevice, index) => {
          // connectedDevice: {"socketId1":["Desktop","access"]}
          if (Object.keys(connectedDevice)[0] === socketId) {
            rooms[key].splice(index, 1);
            console.log(rooms[key]);
            throw BreakException;
          }
        });
      });
    } catch (err) {
      console.log(err);
    }
  },
};
