let players = [];

const log = (msg) => {
  App.sayToAll(msg, 0x00ffff);
};

App.onInit.Add(function () {
  App.cameraEffect = 1;
  App.cameraEffectParam1 = 800;
});

App.onJoinPlayer.Add(function (player) {
  player.tag = { sturn: false, sTime: 2, condition: ['noName'] };
  player.displayRatio = player.isMobile ? 1 : 1.5;

  initCheckList(player);
  savePlayer(player);
});

App.onObjectTouched.Add(function (sender, x, y, tileID, obj) {
  if (obj !== null) {
    if (obj.type == ObjectEffectType.INTERACTION_WITH_ZEPSCRIPTS) {
      switch (obj.text) {
        case '0':
          if (sender.tag.condition.includes('noName')) {
            openSetNameDialog(sender);
            break;
          }
        case '1': // normal
        case '2': // input
        case '3': // image
          openDialog(obj.text, sender, Number(obj.param1));
          // if (obj.param1 == '7' && !sender.tag.condition.includes('black')) sender.tag.condition += 'black';
          // else if (obj.param1 == '10' && !sender.tag.condition.includes('help')) sender.tag.condition += 'help';
          // else if (obj.param1 == '25' && !sender.tag.condition.includes('clean')) sender.tag.condition += 'clean';
          // openDialog(obj.text, sender, NPC_DIALOG_FLOW[obj.param1]);
          break;
        case '9':
          if (obj.param1 == '100') {
            bagDialog(sender);
          }
          break;
        case '10':
          backToSeatDialog(sender, NPC_DIALOG_FLOW[obj.param1]);
          break;
        default:
          break;
      }
    }
  }
});

App.addOnLocationTouched('toilet', function (player) {
  if (!player.tag.condition.includes('toilet')) {
    player.tag.condition += 'toilet';
    openDialog(1, player, 40);
  }
});
App.addOnLocationTouched('coin', function (player) {
  if (!player.tag.condition.includes('coin')) {
    player.tag.condition += 'coin';
    openDialog(1, player, 42);
  }
});
App.addOnLocationTouched('finish', function (player) {
  if (!player.tag.condition.includes('finish')) {
    player.tag.condition += 'finish';
    player.tag.widgetTimer.destroy();
    player.tag.widgetTimer = null;
  }
});

App.onUpdate.Add(function (dt) {
  // for (let i in players) {
  //   let player = players[i];
  //   if (player.tag.sturn) {
  //     player.tag.sTime -= dt;
  //     if (player.tag.sTime <= 0) {
  //       player.tag.sturn = false;
  //       player.tag.sTime = 3;
  //       player.moveSpeed = player.tag.speedUp ? 110 : 80;
  //       player.sendUpdated();
  //       openDialog(1, player, [{ name: MY_NAME, text: DREAM_TEXT }]);
  //     }
  //   }
  // }
});

App.addOnKeyDown(27, function (player) {
  if (player.tag.widgetDialog != null) {
    closeDialog(player);

    // if (player.tag.widgetDialogType == 'BACK_TO_SEAT') {
    //   backToSeat(player);
    // } else if (player.tag.widgetDialogType == 'BACK_TO_HOME') {
    //   backToHome(player);
    // }
  }
});

const openSetNameDialog = (player) => {
  const SET_NAME_DIALOG_WIDGET_FILE = 'widget/dialog/setName.html';
  player.tag.widgetDialogType = dialogType[0];
  player.tag.widgetDialog = player.isMobile
    ? player.showWidgetResponsive(SET_NAME_DIALOG_WIDGET_FILE, 30, 10, 30, 10)
    : player.showWidgetResponsive(SET_NAME_DIALOG_WIDGET_FILE, 35, 25, 35, 25);

  player.tag.widgetDialog.onMessage.Add(function (player, msg) {
    if (msg.type == 'setName') {
      player.name = msg.name;
      player.tag.condition = player.tag.condition.filter((c) => c !== 'noName');
      savePlayer(player);
      startTimer(player);
      setCheckList(player, 1);
    } else if (msg.type == 'startDialog') {
      player.tag.widgetDialog.destroy();
      player.tag.widgetDialog = null;
      openDialog(1, player, 0);
    }
  });
};

const initCheckList = (player) => {
  player.tag.widgetCheckList = player.isMobile
    ? player.showWidgetResponsive('widget/checkList.html', 12, 50, 78, 2)
    : player.showWidget('widget/checkList.html', 'topLeft', 250, 80);
  player.tag.widgetCheckList.sendMessage({
    listNo: 0,
    isMobile: player.isMobile,
  });
};

const setCheckList = (player, listNo) => {
  player.tag.widgetCheckList.sendMessage({
    isMobile: player.isMobile,
    listNo,
  });
};

const startTimer = (player) => {
  player.tag.widgetTimer = player.isMobile
    ? player.showWidgetResponsive('widget/timer.html', 12, 2, 78, 60)
    : player.showWidget('widget/timer.html', 'topRight', 200, 50);
  player.tag.widgetTimer.sendMessage({
    timer: 1800,
    isMobile: player.isMobile,
  });
  player.tag.widgetTimer.onMessage.Add(function (player, msg) {
    if (msg.type == 'timeOut') {
      App.sayToAll(`아아... ${player.name}님이 회식으로 가게 되었습니다!`, 0xff0000);
      // backToHome(player);
      // backToHomeDialog(player, [{ name: MY_NAME, text: HOME_TEXT }]);
      // player.tag.widgetTimer.destroy();
      // player.tag.widgetTimer = null;
    }
  });
};

const savePlayer = (player) => {
  player.sendUpdated();
  players = App.players;
};

// const backToSeat = (player) => {
//   player.spawnAt(30, 10, 3);
//   player.tag.sturn = true;
//   player.tag.sTime = 3;
//   player.moveSpeed = 0;
//   player.sendUpdated();
// };

// const backToSeatDialog = (player, dialogFlow) => {
//   if (player.tag.widgetDialog == null) {
//     player.tag.widgetDialogType = 'BACK_TO_SEAT';
//     player.tag.widgetDialog = player.isMobile
//       ? player.showWidgetResponsive('widget/dialog.html', 30, 10, 30, 10)
//       : player.showWidgetResponsive('widget/dialog.html', 35, 30, 35, 30);

//     player.tag.widgetDialog.onMessage.Add(function (player, msg) {
//       if (msg.type == 'closeDialog' && player.tag.widgetDialog != null) {
//         player.tag.widgetDialog.destroy();
//         player.tag.widgetDialog = null;
//         player.tag.widgetDialogType = null;

//         backToSeat(player);
//       }
//     });
//   }

//   player.tag.widgetDialog.sendMessage({
//     type: 1,
//     condition: player.tag.condition,
//     dialogFlow,
//   });
// };

const dialogType = {
  0: 'setName',
  1: 'normal',
  2: 'input',
  3: 'image',
};

const dialogSize = {
  0: [30, 10, 30, 10, 35, 25, 35, 25],
  3: [20, 5, 20, 5, 20, 30, 20, 30],
};

const openDialog = (type, player, dialogId) => {
  if (type == 0 && !player.tag.condition.includes('noName')) {
    type = 1; // 이름 설정 후 type 보정
  }

  if (player.tag.widgetDialog == null) {
    player.tag.widgetDialogType = dialogType[type];
    player.tag.widgetDialog = player.showWidgetResponsive(
      `widget/dialog/${dialogType[type]}.html`,
      dialogSize[type == 3 ? 3 : 0][player.isMobile ? 0 : 4],
      dialogSize[type == 3 ? 3 : 0][player.isMobile ? 1 : 5],
      dialogSize[type == 3 ? 3 : 0][player.isMobile ? 2 : 6],
      dialogSize[type == 3 ? 3 : 0][player.isMobile ? 3 : 7]
    );
    player.tag.widgetDialog.onMessage.Add(function (player, msg) {
      if (msg.type == 'closeDialog') {
        closeDialog(player);
      } else if (msg.type == 'speedUp') {
        if (!player.tag.isSpeedUp) {
          speedUp(player);
        } else {
          openToast(player, TEXT_AGAIN_COFFEE, 2);
        }
        closeDialog(player);
      } else if (msg.type == 'setCheckList') {
        setCheckList(player, msg.listNo);
        closeDialog(player);
      }

      // if (msg.type == 'backToSeat') backToSeat(player);
    });
  }

  player.tag.widgetDialog.sendMessage({ type, condition: player.tag.condition, dialogId });
};

const closeDialog = (player) => {
  player.tag.widgetDialog.destroy();
  player.tag.widgetDialog = null;
  player.tag.widgetDialogType = null;
};

const openToast = (player, msg, timer = 2) => {
  player.tag.widgetToast = player.isMobile
    ? player.showWidgetResponsive(`widget/toast.html`, 60, 35, 10, 35)
    : player.showWidgetResponsive(`widget/toast.html`, 60, 35, 10, 35);

  player.tag.widgetToast.sendMessage({ msg, timer });
  player.tag.widgetToast.onMessage.Add(function (player, msg) {
    if (msg.type == 'toastOut') {
      player.tag.widgetToast.destroy();
      player.tag.widgetToast = null;
    }
  });
};

const speedUp = (player) => {
  openToast(player, TEXT_SPEED_UP_COFFEE, 3);
  player.tag.isSpeedUp = true;
  player.moveSpeed = 120;
  savePlayer(player);
};

// const bagDialog = (player) => {
//   player.showPrompt('보관함의 비밀번호를 입력하세요.', (inputText) => {
//     if (inputText == BAG_ANSWER) {
//       player.moveSpeed = 110;
//       player.tag.speedUp = true;
//       openDialog(1, player, [{ name: MY_NAME, text: BAG_TEXT }]);
//       savePlayer(player);
//     } else {
//       openDialog(1, player, [{ name: MY_NAME, text: BAG_WRONG_ANSWER }]);
//     }
//   });
// };

// const backToHomeDialog = (player, dialogFlow) => {
//   if (player.tag.widgetDialog == null) {
//     player.tag.widgetDialogType = 'BACK_TO_HOME';
//     player.tag.widgetDialog = player.isMobile
//       ? player.showWidgetResponsive('widget/dialog.html', 30, 10, 30, 10)
//       : player.showWidgetResponsive('widget/dialog.html', 35, 30, 35, 30);

//     player.tag.widgetDialog.onMessage.Add(function (player, msg) {
//       if (msg.type == 'closeDialog' && player.tag.widgetDialog != null) {
//         player.tag.widgetDialog.destroy();
//         player.tag.widgetDialog = null;
//         player.tag.widgetDialogType = null;
//       }
//     });
//   }

//   player.tag.widgetDialog.sendMessage({
//     type: 1,
//     condition: player.tag.condition,
//     dialogFlow,
//   });
// };

// const backToHome = (player) => {
//   player.spawnAt(106, 148, 1);
//   player.sendUpdated();
// };

// const ACTION_TYPE = {
//   1: 'SINGLE_DIALOG',
//   2: 'INTERACTION_DIALOG',
//   3: 'MULTI_BUTTON_DIALOG',
//   4: 'INPUT_DIALOG',

//   9: 'OPEN_PROMPT',
//   10: 'BACK_TO_SEAT',
//   11: 'BACK_TO_HOME',
// };

const TEXT_SPEED_UP_COFFEE = '커피를 마셨더니 몸이 가벼워진 것 같다.';
const TEXT_AGAIN_COFFEE = '일단 받고 보자..';
