/* TODO: 버그 리스트
  1. 한스노트 확인하지 않아도 애니 대화 옵션 가능하다. -> 불가능하도록 수정할 것. (listNo 연결해서)
*/

let players = [];

App.onInit.Add(function () {
  App.cameraEffect = 1;
  App.cameraEffectParam1 = 800;
});

App.onJoinPlayer.Add(function (player) {
  initPlayer(player);
});

const initPlayer = (player) => {
  player.tag = {
    condition: [conditionTag[0]],
    listNo: 0,
    noteStatus: {
      flowNo: 0,
      finishPage: -1,
      isSetChkList: false,
    },
  };
  player.displayRatio = player.isMobile ? 1 : 1.5;

  initCheckList(player);
  savePlayer(player);
};

App.onObjectTouched.Add(function (sender, x, y, tileID, obj) {
  if (obj == null) return;

  if (obj.type == ObjectEffectType.INTERACTION_WITH_ZEPSCRIPTS) {
    let dialogObject = {
      type: Number(obj.text),
      id: Number(obj.param1),
    };
    dialogObject = handleObjectScenario(sender, dialogObject);

    if (dialogObject.type == 0 && checkCondition(sender, conditionTag[0])) openSetNameDialog(sender);
    else openDialog(sender, dialogObject);
  }
});

App.addOnLocationTouched('startLimit', function (player) {
  if (checkCondition(player, conditionTag[0])) {
    player.spawnAtLocation('startLimitRespawn', 4);
    openToast(player, '쟝을 먼저 만나보자.');
  }
});
App.addOnLocationTouched('waterFall', function (player) {
  if (checkCondition(player, conditionTag[4]) && [6, 7].includes(player.tag.listNo)) {
    player.tag.listNo == 8;
    setCheckList(player, 8);
  }
});
App.addOnLocationTouched('toilet', function (player) {
  if (!checkCondition(player, 98)) openDialog(player, { type: 1, id: 40 });
  handleObjectScenario(player, { type: 1, id: 40 });
});
App.addOnLocationTouched('coin', function (player) {
  if (!checkCondition(player, 99)) openDialog(player, { type: 1, id: 42 });
  handleObjectScenario(player, { type: 1, id: 42 });
});
App.addOnLocationTouched('finishLine', function (player) {
  if (!checkCondition(player, conditionTag[100])) {
    addCondition(player, 'finish');
  }
  player.tag.widgetTimer.destroy();
  player.tag.widgetTimer = null;
  App.showCenterLabel(`${player.name} 님이 한스를 찾았습니다!`);
});
App.addOnLocationTouched('homeLine', function (player) {
  if (checkCondition(player, 97)) {
    initPlayer(player);
    openToast(player, '잠시.. 꿈을 꿨던 것 같다.');
  }
});

App.addOnKeyDown(27, function (player) {
  if (player.tag.widgetDialog != null) closeDialog(player);
});

const handleObjectScenario = (player, { type, id }) => {
  if (type == 0) {
    if (!checkCondition(player, 0)) return { type: 1, id };
  }
  // 1. normal
  else if (type == 1) {
    if (id == 10 && !checkCondition(player, 1)) addCondition(player, 1); // 가비 화물 도움 태그
    else if (id == 15 && checkCondition(player, 5)) return { type: 1, id: 16 }; // 폭포수 미션 끝나고 애니 대화
    else if (id == 22 && player.tag.listNo == 6) setCheckList(player, 7); // 여사님 대화: 체크리스트 6->7
    else if (id == 27 && player.tag.listNo >= 10) {
      // 문동은 미션 전개
      // 이후 미션 진행 추가할 때는 앞순서로 넣어야겠지?
      if (checkCondition(player, conditionTag[7])) return { type: 1, id: 44 }; // 미션2 - 개수 파악 완료 시: 이후 전개
      else if (checkCondition(player, conditionTag[6])) return { type: 2, id: 3 }; // 미션2 진행 시: 모니터 개수 입력창
      else if (checkCondition(player, conditionTag[5])) return { type: 1, id: 43 }; // 미션1 완료 시: 미션2 진행
    } else if (id == 35 && !checkCondition(player, conditionTag[2])) {
      openToast(player, MEMO_NO_TOILET);
      return { type: -1, id: -1 };
    } else if (id == 40 && !checkCondition(player, conditionTag[98])) addCondition(player, conditionTag[98]);
    else if (id == 42 && !checkCondition(player, conditionTag[99])) addCondition(player, conditionTag[99]);
  }
  // 2. input
  else if (type == 2) {
    if (id == 0 && checkCondition(player, conditionTag[4])) return { type: 1, id: 7 }; // SE 보관함 오픈: input->normal
  }

  return { type, id };
};

const handleDialogMessage = (player, msg) => {
  if (msg.type == 'closeDialog') {
    closeDialog(player);
  } else if (msg.type == 'speedUp') {
    !player.tag.isSpeedUp ? speedUp(player) : openToast(player, TEXT_AGAIN_COFFEE, 2);
  } else if (msg.type == 'setCheckList') {
    setCheckList(player, msg.listNo);
  } else if (msg.type == 'openToast') {
    openToast(player, msg.toast, 2);
  } else if (msg.type == 'addCondition') {
    addCondition(player, msg.condition);
  } else if (msg.type == 'openHansNote') {
    openNoteButton(player);
  } else if (msg.type == 'saveHansNote') {
    player.tag.noteStatus = msg.noteStatus;
  } else if (msg.type == 'nextDialog') {
    player.tag.widgetDialog.destroy();
    player.tag.widgetDialog = null;
    openDialog(player, { type: msg.dialogType, id: msg.link });
  } else if (msg.type == 'downTimer') {
    player.tag.widgetTimer.sendMessage({
      type: -1,
    });
  } else if (msg.type == 'missionComplete') {
    openToast(player, '한스의 노트를 다시 확인해보자.');
    if (msg.missionNo == 1) {
      addCondition(player, 5);
      player.tag.noteStatus = {
        flowNo: 1, // 미션1 클리어: 0 -> 1
        finishPage: -1,
        isSetChkList: false,
      };
    } else if (msg.missionNo == 2) {
      addCondition(player, 8);
      player.tag.noteStatus = {
        flowNo: 2, // 미션1 클리어: 1 -> 2
        finishPage: -1,
        isSetChkList: false,
      };
    }
  }
};

const checkCondition = (player, condition) => {
  if (isNaN(condition)) return player.tag.condition.includes(condition);
  else return player.tag.condition.includes(conditionTag[condition]);
};

const addCondition = (player, condition) => {
  if (!checkCondition(player, condition)) {
    if (isNaN(condition)) player.tag.condition.push(condition);
    else player.tag.condition.push(conditionTag[condition]);
  }
};

// fixed functions
const savePlayer = (player) => {
  player.sendUpdated();
  players = App.players;
};

const startTimer = (player) => {
  player.tag.widgetTimer = player.isMobile
    ? player.showWidgetResponsive('widget/timer.html', 12, 2, 78, 60)
    : player.showWidget('widget/timer.html', 'topRight', 200, 50);
  player.tag.widgetTimer.sendMessage({
    type: 1,
    timer: 1800,
    isMobile: player.isMobile,
  });
  player.tag.widgetTimer.onMessage.Add(function (player, msg) {
    if (msg.type == 'timeOut') {
      App.sayToAll(`아아... ${player.name}님이 한스를 찾지 못했습니다...!`, 0xff0000);
      addCondition(player, 97);
      player.spawnAtLocation('home', 1);
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

const speedUp = (player) => {
  openToast(player, TEXT_SPEED_UP_COFFEE, 3);
  player.tag.isSpeedUp = true;
  player.moveSpeed = 120;
  savePlayer(player);
};

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
      openDialog(player, { type: 1, id: 0 });
    }
  });
};

const openDialog = (player, { type, id }) => {
  if (type == -1) return;

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
    id,
    condition: player.tag.condition,
    noteStatus: player.tag.noteStatus,
  });
};

const closeDialog = (player) => {
  player.tag.widgetDialog.destroy();
  player.tag.widgetDialog = null;
  player.tag.widgetDialogType = null;

  if (checkCondition(player, conditionTag[4]) && !player.tag.widgetNoteButton) openNoteButton(player);
};

const openNoteButton = (player) => {
  player.tag.widgetNoteButton = player.isMobile
    ? player.showWidgetResponsive(`widget/noteButton.html`, 44, 82, 44, 2)
    : player.showWidget(`widget/noteButton.html`, 'middleleft', 90, 85);

  player.tag.widgetNoteButton.onMessage.Add(function (player, msg) {
    if (msg.type == 'clickButton') {
      addCondition(player, 41);
      openDialog(player, { type: 4, id: 0 });
      closeNoteButton(player);
    }
  });
};

const closeNoteButton = (player) => {
  player.tag.widgetNoteButton.destroy();
  player.tag.widgetNoteButton = null;
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

const conditionTag = {
  0: 'noName',
  1: 'help',
  2: 'hansCard',
  3: 'openSE',
  4: 'hansNote',
  41: 'hansNoteOpen',
  5: 'complete1',
  6: 'startMission2',
  7: 'monitorComplete',
  8: 'complete2',
  9: 'levi',
  97: 'goHome',
  98: 'toilet',
  99: 'coin',
  100: 'finish',
};

const TEXT_SPEED_UP_COFFEE = '커피를 마셨더니 몸이 가벼워진 것 같다.';
const TEXT_AGAIN_COFFEE = '일단 받고 보자..';
const MEMO_NO_TOILET = '아무리 그래도 프라이버시는 지켜주자.';
