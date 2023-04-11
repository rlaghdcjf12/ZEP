let players = [];

const log = (msg) => {
  App.sayToAll(msg, 0x00ffff);
};

App.onInit.Add(function () {
  App.cameraEffect = 1;
  App.cameraEffectParam1 = 800;
});

App.onJoinPlayer.Add(function (player) {
  player.tag = {
    sturn: false,
    sTime: 2,
    condition: ['noName'],
    noteStatus: {
      flowNo: 0,
      finishPage: -1,
      isSetChkList: false,
    },
  };
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
          if (obj.text == '2' && obj.param1 == '0') {
            if (sender.tag.condition.includes('hansNote')) {
              obj.text = '1';
              obj.param1 = '7';
            }
          }
        case '3': // image
          openDialog(obj.text, sender, Number(obj.param1));
          // if (obj.param1 == '7' && !sender.tag.condition.includes('black')) sender.tag.condition += 'black';
          // else
          if (obj.param1 == '10' && !sender.tag.condition.includes('help')) sender.tag.condition.push('help');
          else if (obj.param1 == '22' && sender.tag.listNo == 6) setCheckList(sender, 7);
          // openDialog(obj.text, sender, NPC_DIALOG_FLOW[obj.param1]);
          break;
        default:
          break;
      }
    }
  }
});

App.addOnLocationTouched('toilet', function (player) {
  if (!player.tag.condition.includes('toilet')) {
    player.tag.condition.push('toilet');
    openDialog(1, player, 40);
  }
});
App.addOnLocationTouched('coin', function (player) {
  if (!player.tag.condition.includes('coin')) {
    player.tag.condition.push('coin');
    openDialog(1, player, 42);
  }
});
App.addOnLocationTouched('finish', function (player) {
  if (!player.tag.condition.includes('finish')) {
    player.tag.condition.push('finish');
    player.tag.widgetTimer.destroy();
    player.tag.widgetTimer = null;
  }
});
App.addOnLocationTouched('startLimit', function (player) {
  if (player.tag.condition.includes('noName')) {
    player.spawnAtLocation('startLimitRespawn', 4);
    openToast(player, '쟝을 먼저 만나보자.');
  }
});
App.addOnLocationTouched('waterFall', function (player) {
  if (player.tag.condition.includes('hansNote') && [6, 7].includes(player.tag.listNo)) {
    player.tag.listNo == 8;
    setCheckList(player, 8);
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
    ? player.showWidgetResponsive('widget/checkList.html', 12, 47, 78, 2)
    : player.showWidget('widget/checkList.html', 'topLeft', 280, 80);
  player.tag.listNo = 0;
  player.tag.widgetCheckList.sendMessage({
    listNo: 0,
    isMobile: player.isMobile,
  });
};

const setCheckList = (player, listNo) => {
  player.tag.listNo = listNo;
  player.tag.widgetCheckList.sendMessage({
    listNo,
    isMobile: player.isMobile,
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
      App.sayToAll(`아아... ${player.name}님이 세상을 구원하지 못했습니다...!`, 0xff0000);
    }
  });
};

const savePlayer = (player) => {
  player.sendUpdated();
  players = App.players;
};

const dialogType = {
  0: 'setName',
  1: 'normal',
  2: 'input',
  3: 'image',
  4: 'hansNote',
};

const dialogSize = {
  0: [20, 5, 20, 5, 35, 25, 35, 25],
  1: [20, 5, 20, 5, 35, 25, 35, 25],
  2: [20, 5, 20, 5, 20, 25, 20, 25],
  3: [20, 5, 20, 5, 20, 30, 20, 30],
  4: [20, 5, 20, 5, 20, 30, 20, 30],
};

const openDialog = (type, player, dialogId) => {
  if (type == 0 && !player.tag.condition.includes('noName')) {
    type = 1; // 이름 설정 후 type 보정
  }

  if (player.tag.widgetDialog == null) {
    player.tag.widgetDialogType = dialogType[type];
    player.tag.widgetDialog = player.showWidgetResponsive(
      `widget/dialog/${dialogType[type]}.html`,
      dialogSize[type][player.isMobile ? 0 : 4],
      dialogSize[type][player.isMobile ? 1 : 5],
      dialogSize[type][player.isMobile ? 2 : 6],
      dialogSize[type][player.isMobile ? 3 : 7]
    );
    player.tag.widgetDialog.onMessage.Add((player, msg) => handleDialogMessage(player, msg));
  }

  player.tag.widgetDialog.sendMessage({
    type,
    dialogId,
    condition: player.tag.condition,
    noteStatus: player.tag.noteStatus,
  });
};

const handleDialogMessage = (player, msg) => {
  if (msg.type == 'closeDialog') {
    closeDialog(player);
  } else if (msg.type == 'speedUp') {
    !player.tag.isSpeedUp ? speedUp(player) : openToast(player, TEXT_AGAIN_COFFEE, 2);
  } else if (msg.type == 'setCheckList') {
    setCheckList(player, msg.listNo);
    if (msg.listNo == 8) {
      openToast(player, '한스의 노트를 다시 확인해보자.', 2);
      setCheckList(player, 9);
      player.tag.condition.push('Complete1');
      player.tag.condition.noteStatus = {
        flowNo: 1,
        finishPage: -1,
        isSetChkList: false,
      };
    }
  } else if (msg.type == 'openToast') {
    openToast(player, msg.toast, 2);
  } else if (msg.type == 'addCondition') {
    log(`[handleDialogMessage] condition : ${msg.condition}`);
    player.tag.condition.push(msg.condition);
  } else if (msg.type == 'openHansNote') {
    openNoteButton(player);
  } else if (msg.type == 'saveHansNote') {
    player.tag.noteStatus = msg.noteStatus;
  } else if (msg.type == 'nextDialog') {
    log(`type : ${msg.dialogType}, link : ${msg.link}`);
    player.tag.widgetDialog.destroy();
    player.tag.widgetDialog = null;
    openDialog(msg.dialogType, player, msg.link);
  }
};

const closeDialog = (player) => {
  player.tag.widgetDialog.destroy();
  player.tag.widgetDialog = null;
  player.tag.widgetDialogType = null;

  if (player.tag.condition.includes('hansNote') && !player.tag.widgetNoteButton) openNoteButton(player);
};

const openToast = (player, msg, timer = 2) => {
  if (player.tag.widgetToast == null) {
    player.tag.widgetToast = player.isMobile
      ? player.showWidgetResponsive(`widget/toast.html`, 60, 25, 20, 25)
      : player.showWidgetResponsive(`widget/toast.html`, 60, 35, 10, 35);

    player.tag.widgetToast.onMessage.Add(function (player, msg) {
      if (msg.type == 'toastOut') {
        player.tag.widgetToast.destroy();
        player.tag.widgetToast = null;
      }
    });
  }
  player.tag.widgetToast.sendMessage({ msg, timer });
};

const speedUp = (player) => {
  openToast(player, TEXT_SPEED_UP_COFFEE, 3);
  player.tag.isSpeedUp = true;
  player.moveSpeed = 120;
  savePlayer(player);
};

const openNoteButton = (player) => {
  player.tag.widgetNoteButton = player.isMobile
    ? player.showWidgetResponsive(`widget/noteButton.html`, 44, 82, 44, 2)
    : player.showWidget(`widget/noteButton.html`, 'middleleft', 90, 85);

  player.tag.widgetNoteButton.onMessage.Add(function (player, msg) {
    if (msg.type == 'clickButton') {
      openDialog(4, player, 0);
      closeNoteButton(player);
    }
  });
};

const closeNoteButton = (player) => {
  player.tag.widgetNoteButton.destroy();
  player.tag.widgetNoteButton = null;
};

const TEXT_SPEED_UP_COFFEE = '커피를 마셨더니 몸이 가벼워진 것 같다.';
const TEXT_AGAIN_COFFEE = '일단 받고 보자..';
