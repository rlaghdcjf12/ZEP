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
          openDialog(obj.text, sender, NPC_DIALOG_FLOW[obj.param1]);
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
    openDialog(1, player, NPC_DIALOG_FLOW[40]);
  }
});
App.addOnLocationTouched('coin', function (player) {
  if (!player.tag.condition.includes('coin')) {
    player.tag.condition += 'coin';
    openDialog(1, player, NPC_DIALOG_FLOW[42]);
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
      openDialog(1, player, NPC_DIALOG_FLOW[0]);
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

const openDialog = (type, player, dialogFlow) => {
  if (type == 0 && !player.tag.condition.includes('noName')) {
    type = 1; // 이름 설정 후 type 보정
  }

  if (player.tag.widgetDialog == null) {
    player.tag.widgetDialogType = dialogType[type];
    player.tag.widgetDialog = player.isMobile
      ? player.showWidgetResponsive(`widget/dialog/${dialogType[type]}.html`, 30, 10, 30, 10)
      : player.showWidgetResponsive(`widget/dialog/${dialogType[type]}.html`, 35, 25, 35, 25);
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

  player.tag.widgetDialog.sendMessage({ type, condition: player.tag.condition, dialogFlow });
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

const NPC_NAME = {
  0: 'MS 쟝',
  1: 'CN 샤샤',
  2: 'AG 라이너',
  3: 'AG 오냥코퐁',
  4: 'CS 그리샤',
  5: 'CD 미카사',
  6: 'MI 아르민',
  7: 'CN 파르코',
  8: 'EHS 케니',
  9: 'MD 지크',
  10: 'MI 가비',
  11: 'MS 카를라',
  12: 'MS 베르톨트',
  13: 'MD 프록',
  14: 'MI 에렌',
  15: 'CS 애니',
  16: 'MI 쿠도',
  17: 'AG 김희성',
  18: 'MI 유진',
  19: 'MD 구동매',
  20: 'CD 고애신',
  21: 'MS 서민영',
  22: 'CN 진도준',
  23: 'CD 진성준',
  24: 'MS 진양철',
  25: '치프',
  26: 'AG 피크',
  27: 'MI 문동은',
  28: 'AG 박연진',
  29: 'MD 전재준',
  30: 'MI 최혜정',
  31: 'CD 이사라',
  32: 'CD 손명오',
  33: 'EHS 강인구',
  34: 'MD 히스토리아',
  35: 'MI 유미르',
  36: 'MI 한지',
  37: 'MI 팀장 리바이',
  38: 'EHS 마르코',
  39: '거울 세계 이필옥',
  40: '구렁이 소환사',
  41: '환경미화 여사님',
  42: '의문의 관리인',
};

const MY_NAME = 'MI 한스';
const START_TEXT =
  '오늘 갑자기 회식을 하자고 한다...😅 여자친구와 기념일이라서 일찍 가야하는데, 보관함에 가방 넣고 몰래 화장실로 가는 척 나가야겠다! 😏';
const BAG_ANSWER = 'build';
const BAG_TEXT = '가방을 보관함에 넣었다. 몸이 한결 가벼워진 것 같다.';
const BAG_WRONG_ANSWER = '비밀번호가 뭐였더라...';
const DREAM_TEXT = '헉! 꾸... 꿈?! 회식 가는 줄 알았네...';
const HOME_TEXT = '으윽... 회식에서 너무 많이 마셨다. 얼른 다시 출근하자...';

/* 신규 문구 */
const TEXT_SPEED_UP_COFFEE = '커피를 마셨더니 몸이 가벼워진 것 같다.';
const TEXT_AGAIN_COFFEE = '일단 받고 보자..';

const NPC_DIALOG_FLOW = {
  0: [
    {
      name: NPC_NAME[0],
      text: '한스님이라면... 옆에 휴게공간에서 봤던 것 같아요! 🙂',
      options: [
        {
          number: 0,
          text: '네~ 감사합니다!',
          link: -1,
        },
      ],
    },
  ],
  1: [
    {
      name: NPC_NAME[1],
      text: '오~ 한스님 잘 만났다! 저 이번에 제주도 내려가는데 맛집 좀 추천해주세요~!',
      options: ['제주시 동쪽에 동복 해녀촌이라고 있는데, 가셔서 회국수랑 성게국수 드셔보세요!'],
    },
  ],
  2: [
    {
      name: NPC_NAME[2],
      text: '와... 한스님 드디어 비트코인 가나요?',
      options: ['같이 외치시죠. 제발 좀 가즈아아아~!'],
    },
  ],
  3: [{ name: NPC_NAME[3], text: '제가 이번 여름에 서핑을 좀 했더니 이렇게 타버렸습니다...' }],
  4: [{ name: NPC_NAME[4], text: '한스님... 혹시 git 잘 하세요? ㅠㅠ', options: ['흘깃흘깃은 잘 하는데...'] }],
  5: [
    {
      name: NPC_NAME[5],
      text: '이런 방탈출 게임을 만들 생각을 하다니... 하라는 공부는 안하고!',
      options: ['이것도 다 역량 강화의 일환으로...'],
    },
  ],
  6: [
    {
      name: NPC_NAME[6],
      text: '한스... 우리 팀 이름이 모던애플리케이션팀에서 이번에 뭘로 바뀌었더라?',
      options: ['여기 바로 앞에 보관함에 써져 있잖아...'],
    },
  ],
  7: [{ name: NPC_NAME[7], text: '분명히 수상하게 생긴 깜둥이를 봤는데...' }],
  8: [{ name: NPC_NAME[8], text: '이거 이거... 허위 사실 유포 죄로 넣어버릴까' }],
  9: [{ name: NPC_NAME[9], text: '아니, 이거 하루가 멀다하고 기획이 바뀌냐...?' }],
  10: [{ name: NPC_NAME[10], text: '특수 엘리베이터로 화물 옮기려면 팀장님께 사원증을 빌려야 하나...?' }],
  11: [{ name: NPC_NAME[11], text: '저는 회의는 zoom보단 slack이 나은 것 같기도 해요 🤔' }],
  12: [
    { name: NPC_NAME[12], text: '무슨 급한 일 있으세요...?', options: ['아니요...'] },
    {
      name: NPC_NAME[12],
      text: '회의 하고 있잖아요. 급하지도 않은데 말을 걸면 실례 아닌가...?',
      options: ['죄송합니다...'],
    },
  ],
  13: [
    {
      name: NPC_NAME[13],
      text: '코로나 이후 zoom으로 비대면 강의나 세미나 듣는 건 진짜 좋은 것 같긴 해요! 공간의 제약도 없고 😊',
    },
  ],
  14: [
    {
      name: NPC_NAME[14],
      text: '네~ 한스님. 무슨 일 있으세요?',
      options: [
        { text: '아뇨! 그냥 뭐 잘 지내시나 해서 😅', link: 1 },
        { text: '리바이 팀장님 어디 가셨나요?', link: 2 },
      ],
    },
    {
      name: NPC_NAME[14],
      text: '잘 지내죠~ 숄더님도 그렇고 많은 분들이 다들 도와주셔서 적응도 편한 것 같아요!',
      options: [{ text: '다행이네요 🤗', link: -1 }],
    },
    {
      name: NPC_NAME[14],
      text: '아, 리바이 팀장님 방금 식사하러 가셨는데 계단으로 빨리 따라 내려가시면 될 것 같아요!',
      options: [{ text: '감사합니다!', link: -1 }],
    },
  ],
  15: [
    { name: NPC_NAME[15], text: '회식, 꼭 가야되나?', options: ['너도 회식 안 가게?'] },
    { name: NPC_NAME[15], text: '생각 좀 해보려고!', options: ['어, 어... 나도 생각좀 해봐야겠네 😅'] },
  ],
  16: [{ name: NPC_NAME[16], text: '화장실 앞에 다들 회식 가려고 모인 것 같아요 🤗' }],
  17: [
    {
      name: NPC_NAME[17],
      text: '술, 음식, 노래. 나는 이 무용한 것들이 좋소. 동무도 회식에 가서 이 무용한 것들을 함께 즐기세.',
      options: ['(run)'],
    },
  ],
  18: [{ name: NPC_NAME[18], text: '6시 반 회식. 그 때 그 자리에 앉아 있겠네.', options: ['그 때 그 자리...?!'] }],
  19: [{ name: NPC_NAME[19], text: '운이 좋거나, 호기심이 많거나.' }],
  20: [{ name: NPC_NAME[20], text: '너! 회식 가지?! 안 가기만 해!!', options: ['아.. 그.. 그게'] }],
  21: [
    {
      name: NPC_NAME[21],
      text: 'Oh~ 들어가려고 하시는구나~? 여기 여자화장실에 들어가려는 남자가 있어요!!',
      options: ['아.. 아니.. 들어가려는 건 아니에요..!'],
    },
  ],
  22: [{ name: NPC_NAME[22], text: '남자가 흘리는 건 눈물만이 아니다...' }],
  23: [{ name: NPC_NAME[23], text: '때로는 무언가를 비우는 것이 해결책이 될 수 있지요...' }],
  24: [{ name: NPC_NAME[24], text: '메타버스... 그래서 이기 돈이 되는 기가?! 으이? 돈이 되냐 이말이다!' }],
  25: [
    {
      name: NPC_NAME[25],
      text: '오~ 한스, 여긴 무슨 일이야',
      options: [
        { text: '치프님 잘 지내시는 지 안부도 물을 겸 들러봤어요~', link: 1 },
        { text: '저 퇴사할래요', link: 2 },
        { text: '치프님의 힘이 필요합니다..!', link: 3 },
      ],
    },
    {
      name: NPC_NAME[25],
      text: '그런 것도 할 줄 아는 사람이었어?!',
      options: [{ text: '이제 좀... 사람다워지려구요', link: -1 }],
    },
    {
      name: NPC_NAME[25],
      text: '진심이야...? 잠깐만, 일단 회식 가서 이야기좀 더 해보자.',
      options: [{ text: '....네?!', link: -4 }],
    },
    {
      name: NPC_NAME[25],
      text: '내 힘이 필요하다고?',
      options: [
        { text: '치프님의 응원이 필요합니다!', link: 4 },
        {
          condition: 'clean',
          text: '== 전제 조건이 되는 사람과 대화가 필요합니다. (힌트 : 통제구역) ==',
          conditionText: '환경미화 하시는 여사님이 통제구역 출입하는 카드를 두고 나와버렸다고 하셔서 도와드리려구요!',
          link: 5,
        },
      ],
    },
    {
      name: NPC_NAME[25],
      text: '한스가 요즘 많이 힘들구나. 화이팅이야.',
      options: [{ text: '감사합니다!', link: -1 }],
    },
    {
      name: NPC_NAME[25],
      text: '아, 그런 거라면 통제구역 출입용 카드는 문 바로 앞 보관함에 넣어뒀어요. 비밀번호는 내 전화번호 뒷자리 4자.',
      options: [{ text: '감사합니다!', link: -1 }],
    },
  ],
  26: [
    {
      name: NPC_NAME[26],
      text: '치프님한테 볼 일 있으세요?',
    },
  ],
  27: [
    {
      name: NPC_NAME[27],
      text: '오늘도 야근이네. 니 덕분이야 연진아. 이런 순간이 놀랍지도 않은거.',
      options: ['난 연진이가 아닌데... (눈에 초점이 없어보인다. 피하자.)'],
    },
  ],
  28: [
    {
      name: NPC_NAME[28],
      text: '왜 이렇게 늦게 와? 보고 싶어 죽는 줄. 같이 야근 하자.',
      options: ['야근...?'],
    },
  ],
  29: [
    {
      name: NPC_NAME[29],
      text: '이야... 한스! 한가한가봐~ 퇴근 각 보는 거야? 누군 야근하는데??!!',
      options: ['아..!'],
    },
  ],
  30: [
    {
      name: NPC_NAME[30],
      text: '야, 손명오. 니가 백날 소리 질러도 아무도 몰라. 아무도 안와.',
    },
  ],
  31: [
    {
      name: NPC_NAME[31],
      text: '누추한 분이 이런 신성한 곳에는 웬일이래?',
    },
  ],
  32: [
    {
      name: NPC_NAME[32],
      text: "'memento mori' 너의 죽음을 기억하라. 오늘인 것 같다. 아오~!",
    },
  ],
  33: [
    {
      name: NPC_NAME[33],
      text: '아이고, 엘리베이터가 문제가 생겨서 현재 이용을 못할 것 같네요.',
    },
  ],
  34: [
    {
      name: NPC_NAME[34],
      text: '이번에 만들어진 이 휴게실 너무 좋은데요~?!',
      options: [{ number: 0, text: '그러게요! 처음 와봤는데! 역시 본사 본사 하는 이유가 있네요 🥲', link: 1 }],
    },
    {
      name: NPC_NAME[34],
      text: '여기 커피 한 잔 하구 가요~',
      options: [
        { number: 0, text: '감사합니다! 🤗', link: -2 },
        { number: 1, text: '괜찮아요! 🙂', link: -1 },
        { number: 2, text: '혹시 한스 못 보셨을까요? 🤔', link: 2 },
      ],
    },
    {
      name: NPC_NAME[34],
      text: '아~ 한스님이라면 방금 급하게 화장실 가셨어요!',
      options: [{ number: 0, text: '감사합니다!', link: -3, listNo: 2 }],
    },
  ],
  35: [
    {
      name: NPC_NAME[35],
      text: 'slack 확인 왜 안해?! 이 녀석이 회식 안 가려고 자꾸 이리저리 왔다갔다 하는 것 같네!?',
    },
  ],
  36: [{ name: NPC_NAME[36], text: '이거 비밀번호 아직도 예전 그대로네...! 바뀐지가 언젠데!' }],
  37: [
    {
      name: NPC_NAME[37],
      text: '안녕하세요~ 한스님. 회식 가시나요?',
      options: [
        { text: '네, 같이 가시죠!', link: -4 },
        { text: '아, 그건 아니고...', link: 1 },
      ],
    },
    {
      name: NPC_NAME[37],
      text: '다른 볼일이라도 있으신거에요?',
      options: [
        { text: '회식 못 갈 것 같아서요.', link: 2 },
        { text: '혹시 사원증 좀 빌려주실 수 있나요?', link: 3 },
        { text: '누구를 좀 도와드리려고 하는데...', link: 4 },
      ],
    },
    {
      name: NPC_NAME[37],
      text: '그럴 수는 없죠. 필참이에요. 가시죠.',
      options: [{ text: '필참인가요...?', link: -4 }],
    },
    {
      name: NPC_NAME[37],
      text: '갑자기 제 사원증은 왜 찾으세요? 그럼 저는 어떻게 해요?',
      options: [{ text: '아... 그건 그렇네요... 죄송합니다.', link: -1 }],
    },
    {
      name: NPC_NAME[37],
      text: '도와드린다구요? 누구요?',
      options: [
        { text: '치프님이요.', link: 5 },
        {
          condition: 'help',
          text: '== 전제 조건이 되는 사람과 대화가 필요합니다. (힌트 : 화물) ==',
          conditionText: 'MD팀 가비님이요.',
          link: 6,
        },
        {
          condition: 'black',
          text: '== 전제 조건이 되는 사람과 대화가 필요합니다. (힌트 : 깜둥이) ==',
          conditionText: 'CN팀 파르코님이요.',
          link: 7,
        },
      ],
    },
    {
      name: NPC_NAME[37],
      text: '아, 치프님 도와드리는 건 제가 다 했어요. 괜찮아요.',
      options: [{ text: '네!', link: -1 }],
    },
    {
      name: NPC_NAME[37],
      text: '아, 물건들 옮기고 계시는 거 보긴 했어요.',
      options: [{ text: '화물용 엘리베이터를 사용하면 더 좋을 것 같아서요. 사원증좀 빌려주실 수 있을까요?', link: 8 }],
    },
    {
      name: NPC_NAME[37],
      text: '파르코님? 아~ 깜둥이 찾고 있던데. 무시하세요~',
      options: [{ text: '네!', link: -1 }],
    },
    {
      name: NPC_NAME[37],
      text: '아, 그렇네요. 제 사원증은 저희 팀 보관함에 넣어놨어요! 비밀번호는 팀 이름. 요즘 띠딧 덕분에 핸드폰만 가지고 다녀서요! 😊',
    },
  ],
  38: [
    {
      name: NPC_NAME[38],
      text: '죄송합니다. 7층이 공사중이에요!',
    },
  ],
  39: [
    {
      name: NPC_NAME[39],
      text: '기어이 숨겨진 이 금단의 공간까지 찾아오셨군요... 박수 드립니다!',
      options: ['이런 곳이 있었다니...'],
    },
  ],
  40: [
    {
      name: NPC_NAME[40],
      text: '여길 왜 들어오신 거에요...?',
      options: [
        { text: '문이 열리길래...😅', link: 1 },
        { text: 'ㅋㅋㅋㅋㅋㅋㅋㅋ', link: 2 },
        { text: '구경하러요', link: 3 },
      ],
    },
    {
      name: NPC_NAME[40],
      text: '문이 열린다고 이렇게 들어오시면 어떻게 해요...',
      options: [{ text: '제가 반쯤 미쳤나보네요... 오늘 본 것은 못 본 걸로 할게요...', link: -1 }],
    },
    {
      name: NPC_NAME[40],
      text: '웃어...?',
      options: [{ text: '이 상황이 너무 웃겨서...', link: -4 }],
    },
    {
      name: NPC_NAME[40],
      text: '혹시 미치셨어요...?',
      options: [{ text: '요즘 삶이 힘들어서... 정신이 없었네요', link: -1 }],
    },
  ],
  41: [
    {
      name: NPC_NAME[41],
      text: '어쩌죠... 이 통제구역 출입할 수 있는 출입증을 청소하다가 안에 두고 나와버렸어요...',
      options: [{ text: '제가 도와드리죠!', link: 1 }],
    },
    {
      name: MY_NAME,
      text: '통제구역이라면...',
      options: [{ text: '(근데, 내가 어떻게 도와드리지...? 치프님께 여쭤볼까?)', link: -1 }],
    },
  ],
  42: [
    {
      name: NPC_NAME[42],
      text: '아... 앗! 누구냐!',
      options: [{ text: '지금 여기서 뭐하시는 거에요?!!', link: 1 }],
    },
    {
      name: NPC_NAME[42],
      text: '저는 그저... 죄송합니다...! 신고만 하지 말아주세요...!!',
      options: [{ text: '(어떻게 할까...?!)', link: -1 }],
    },
  ],
};
