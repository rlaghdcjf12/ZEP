let players = [];

App.onInit.Add(function () {
  // App.cameraEffect = 1;
  // App.cameraEffectParam1 = 800;
});

App.onJoinPlayer.Add(function (player) {
  player.tag = { lv: 1, exp: 0, power: 1, gold: 0, powerUp: 0, speedUp: 0, goldBoost: 1 };
  player.title = player.title = `lv: ${player.tag.lv} power: ${player.tag.power + player.tag.powerUp}`;
  // player.displayRatio = player.isMobile ? 1 : 1.5;

  // startTimer(player);
  // openDialog(1, player, [{ name: MY_NAME, text: START_TEXT }]);

  savePlayer(player);
});

App.onObjectTouched.Add(function (sender, x, y, tileID, obj) {
  if (obj !== null) {
    if (obj.type == ObjectEffectType.INTERACTION_WITH_ZEPSCRIPTS) {
      switch (obj.text) {
        case '1':
          if (obj.param1 == '1') {
            App.sayToAll(`${sender.name}님이 돈이 증가하였습니다!`, 0xffffff);
            sender.tag.gold += 1;
          } else if (obj.param1 == '2') {
            App.sayToAll(`${sender.name}님이 공격력이 증가하였습니다!`, 0xffffff);
            sender.tag.powerUp += 1;
          } else if (obj.param1 == '3') {
            App.sayToAll(`${sender.name}님이 속도가 증가하였습니다!`, 0xffffff);
            sender.tag.speedUp += 1;
          } else if (obj.param1 == '4') {
            App.sayToAll(`${sender.name}님이 돈 증가가 2배가 되었습니다!`, 0xffffff);
            sender.tag.goldBoost += 1;
          }
          savePlayer(sender);
          break;
        // case '2':
        // case '3':
        //   if (obj.param1 == '7' && !sender.tag.condition.includes('black')) sender.tag.condition += 'black';
        //   else if (obj.param1 == '10' && !sender.tag.condition.includes('help')) sender.tag.condition += 'help';
        //   else if (obj.param1 == '25' && !sender.tag.condition.includes('clean')) sender.tag.condition += 'clean';
        //   openDialog(obj.text, sender, NPC_DIALOG_FLOW[obj.param1]);
        //   break;
        // case '9':
        //   if (obj.param1 == '100') {
        //     bagDialog(sender);
        //   }
        //   break;
        // case '10':
        //   backToSeatDialog(sender, NPC_DIALOG_FLOW[obj.param1]);
        //   break;
        default:
          break;
      }
    }
  }
});

// var trashCount = 0;
// const topLoad = { minX: 1, minY: 8, maxX: 92, maxY: 8 };
// const mainLoad = { minX: 1, minY: 23, maxX: 92, maxY: 27 };
// const leftLoad = { minX: 1, minY: 28, maxX: 4, maxY: 53 };
// const middleLoad = { minX: 65, minY: 28, maxX: 68, maxY: 53 };
// const rightLoad = { minX: 89, minY: 28, maxX: 92, maxY: 53 };
// 쓰레기 줍기 퀘스트 개발할 것.

App.onUpdate.Add(function (dt) {
  for (let i in players) {
    let player = players[i];
    player.title = player.title = `lv: ${player.tag.lv} power: ${player.tag.power + player.tag.powerUp} gold: ${
      player.tag.gold
    } speed: ${80 + player.tag.speedUp}`;
    player.moveSpeed = 80 + player.tag.speedUp;
    savePlayer(player);

    // if (player.tag.sturn) {
    //   player.tag.sTime -= dt;
    //   if (player.tag.sTime <= 0) {
    //     player.tag.sturn = false;
    //     player.tag.sTime = 3;
    //     player.moveSpeed = player.tag.speedUp ? 110 : 80;
    //     player.sendUpdated();

    //     openDialog(1, player, [{ name: MY_NAME, text: DREAM_TEXT }]);
    //   }
  }

  // if (player.tileX == 82 && (player.tileY == 41 || player.tileY == 42) && !player.tag.condition.includes('toilet')) {
  //   player.tag.condition += 'toilet';
  //   openDialog(3, player, NPC_DIALOG_FLOW[40]);
  // }

  // if (player.tileX == 96 && player.tileY == 113 && !player.tag.condition.includes('coin')) {
  //   player.tag.condition += 'coin';
  //   openDialog(3, player, NPC_DIALOG_FLOW[42]);
  // }

  // if (
  //   player.tileX == 118 &&
  //   !player.tag.condition.includes('finish') &&
  //   (player.tileY == 195 || player.tileY == 196 || player.tileY == 197 || player.tileY == 198 || player.tileY == 199)
  // ) {
  //   player.tag.condition += 'finish';
  //   player.tag.widgetTimer.destroy();
  //   player.tag.widgetTimer = null;
  // }
  // }
});

App.addOnKeyDown(27, function (player) {
  // if (player.tag.widgetDialog != null) {
  //   player.tag.widgetDialog.destroy();
  //   player.tag.widgetDialog = null;
  //   if (player.tag.widgetDialogType == 'BACK_TO_SEAT') {
  //     backToSeat(player);
  //   } else if (player.tag.widgetDialogType == 'BACK_TO_HOME') {
  //     backToHome(player);
  //   }
  //   player.tag.widgetDialogType = null;
  // }
});

// const startTimer = (player) => {
//   player.tag.widgetTimer = player.showWidget('widget/timer.html', 'top', 300, 50);
//   player.tag.widgetTimer.sendMessage({
//     timer: 1800,
//   });
//   player.tag.widgetTimer.onMessage.Add(function (player, msg) {
//     if (msg.type == 'timeOut') {
//       App.sayToAll(`아아... ${player.name}님이 회식으로 가게 되었습니다!`, 0xff0000);
//       backToHome(player);
//       backToHomeDialog(player, [{ name: MY_NAME, text: HOME_TEXT }]);
//       player.tag.widgetTimer.destroy();
//       player.tag.widgetTimer = null;
//     }
//   });
// };

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
//       ? player.showWidgetResponsive('widget/dialog.html', 35, 10, 35, 10)
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

// const openDialog = (type, player, dialogFlow) => {
//   if (player.tag.widgetDialog == null) {
//     player.tag.widgetDialogType = ACTION_TYPE[type];
//     player.tag.widgetDialog = player.isMobile
//       ? player.showWidgetResponsive('widget/dialog.html', 35, 10, 35, 10)
//       : player.showWidgetResponsive('widget/dialog.html', 35, 30, 35, 30);

//     player.tag.widgetDialog.onMessage.Add(function (player, msg) {
//       if ((msg.type == 'closeDialog' || msg.type == 'backToSeat') && player.tag.widgetDialog != null) {
//         player.tag.widgetDialog.destroy();
//         player.tag.widgetDialog = null;
//       }

//       if (msg.type == 'backToSeat') backToSeat(player);
//     });
//   }

//   player.tag.widgetDialog.sendMessage({ type, condition: player.tag.condition, dialogFlow });
// };

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
//       ? player.showWidgetResponsive('widget/dialog.html', 35, 10, 35, 10)
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
