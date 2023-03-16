const MY_NAME = 'MI 한스';

let players = [];

App.onInit.Add(function () {
  App.cameraEffect = 1;
  App.cameraEffectParam1 = 1000;
});

App.onJoinPlayer.Add(function (player) {
  player.tag = { sturn: false, sTime: 2 };
  player.displayRatio = player.isMobile ? 1 : 1.5;

  openDialog(1, player, NPC_DIALOG_FLOW[0]);

  savePlayer(player);
});

App.onObjectTouched.Add(function (sender, x, y, tileID, obj) {
  if (obj !== null) {
    if (obj.type == ObjectEffectType.INTERACTION_WITH_ZEPSCRIPTS) {
      if (['1', '2', '3'].includes(obj.text)) openDialog(obj.text, sender, NPC_DIALOG_FLOW[obj.param1]);
    }
  }
});

App.addOnKeyDown(27, function (player) {
  if (player.tag.widgetDialog != null) {
    player.tag.widgetDialog.destroy();
    player.tag.widgetDialog = null;
    player.tag.widgetDialogType = null;
  }
});

const savePlayer = (player) => {
  player.sendUpdated();
  players = App.players;
};

const openDialog = (type, player, dialogFlow) => {
  if (player.tag.widgetDialog == null) {
    player.tag.widgetDialogType = ACTION_TYPE[type];

    player.tag.widgetDialog = player.isMobile
      ? player.showWidgetResponsive('widget/dialog.html', 35, 10, 35, 10)
      : player.showWidgetResponsive('widget/dialog.html', 35, 35, 35, 35);

    player.tag.widgetDialog.onMessage.Add(function (player, msg) {
      if (msg.type == 'closeDialog' && player.tag.widgetDialog != null) {
        player.tag.widgetDialog.destroy();
        player.tag.widgetDialog = null;
      } else if (msg.type == 'backToSeat' && player.tag.widgetDialog != null) {
        player.tag.widgetDialog.destroy();
        player.tag.widgetDialog = null;

        backToSeat(player);
      }
    });
  }

  player.tag.widgetDialog.sendMessage({
    type,
    isMobile: player.isMobile,
    dialogFlow,
  });
};

const ACTION_TYPE = {
  1: 'SINGLE_DIALOG',
  2: 'INTERACTION_DIALOG',
  3: 'MULTI_BUTTON_DIALOG',
};

const NPC_NAME = {
  1: '게임 안내원',
};

const NPC_DIALOG_FLOW = {
  0: [{ name: MY_NAME, text: '이제 곧 6시네... 5층 올라가서 짐 챙기고 퇴근해야겠다. 화살표를 따라 이동해보자.' }],
  1: [
    {
      name: NPC_NAME[1],
      text: '안녕하세요~ 이 게임에 대해서 간단히 안내해드릴게요!',
      buttons: [{ text: '네!', link: 1 }],
    },
    {
      name: NPC_NAME[1],
      text: '우선, 오면서 보셨겠지만 기본적으로 Z와 F키를 통한 행동이 있어요. 안내원에게 말을 걸거나 게이트를 열 때 F키를 통해 입장했을 거에요.',
      buttons: [{ text: '네, 처음이라 익숙치는 않네요.', link: 2 }],
    },
    {
      name: NPC_NAME[1],
      text: '앞의 안내원처럼 말풍선 형태로 이야기를 하는 경우도 있고, 지금처럼 가운데에 창이 뜨는 대화가 있어요.',
      buttons: [{ text: '네, 알겠습니다.', link: 3 }],
    },
    {
      name: NPC_NAME[1],
      text: '게임의 목표는 연구동 5층을 제한시간 30분 안에 탈출하는 것이고, 중간중간 함정이나 문제들이 숨어있어요. 이것들을 잘 맞추고 해결하면서 나오시면 됩니다.',
      buttons: [{ text: '네, 해보겠습니다!', link: 4 }],
    },
    {
      name: NPC_NAME[1],
      text: '특별한 스탬프들도 곳곳에 숨겨놨으니, 잘 찾아보세요 😊',
      buttons: [{ text: '네, 안내 감사합니다~', link: -1 }],
    },
  ],
};
