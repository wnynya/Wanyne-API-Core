'use strict';

import WanyneSession from '../session.mjs';

export default (options = {}) => {
  options.name = options.name ? options.name : 'session';
  options.cookie = options.cookie ? options.cookie : {};

  return async (req, res, next) => {
    req.session = {};

    // 쿠키에서 세션 가져오기
    let sid = req.cookies[options.name];
    req.session = await WanyneSession.of(sid).catch(() => {
      req.session = new WanyneSession();
    });

    // 세션 저장 함수
    req.session.save = async (maxAge = 0, account) => {
      // 세션 ID 쿠키 설정
      const cookie = JSON.parse(JSON.stringify(options.cookie));
      if (maxAge <= 0) {
        req.session.expiredatetime = new Date(0);
      } else {
        cookie.maxAge = maxAge;
        req.session.expiredatetime = new Date(
          req.session.createdatetime.getTime() + cookie.maxAge
        );
      }
      res.cookie(options.name, session.sid, cookie);

      if (account) {
        req.session.account = account.uuid;
      }

      // 세션 정보 저장
      if (session.new) {
        await req.session.create();
      } else {
        await req.session.update();
      }
    };

    // 세션 제거 함수
    req.session.destroy = async () => {
      // 세션 ID 쿠키 제거
      const cookie = JSON.parse(JSON.stringify(options.cookie));
      cookie.expires = new Date(0);
      cookie.maxAge = 0;
      res.cookie(options.name, session.sid, cookie);

      // 세션 정보 제거
      await req.session.delete();
    };

    // 만료된 세션인 경우 세션 제거
    if (
      0 < req.session.expiredatetime.getTime() &&
      req.session.expiredatetime.getTime() < new Date().getTime()
    ) {
      await req.session.delete();
    }

    next();
  };
};
