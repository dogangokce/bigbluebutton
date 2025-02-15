import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import Meetings from '../../../api/meetings';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const isModerator = () => {
  const user = Users.findOne(
    {
      meetingId: Auth.meetingID,
      userId: Auth.userID,
    },
    { fields: { role: 1 } },
  );

  if (user && user.role === ROLE_MODERATOR) {
    return true;
  }

  return false;
};

const isLearningDashboardEnabled = () => (((
  Meetings.findOne(
    { meetingId: Auth.meetingID },
    {
      fields: { 'meetingProp.learningDashboardEnabled': 1 },
    },
  ) || {}).meetingProp || {}).learningDashboardEnabled || false);

const getLearningDashboardAccessToken = () => ((
  Meetings.findOne(
    { meetingId: Auth.meetingID, learningDashboardAccessToken: { $exists: true } },
    {
      fields: { learningDashboardAccessToken: 1 },
    },
  ) || {}).learningDashboardAccessToken || null);

const setLearningDashboardCookie = () => {
  const learningDashboardAccessToken = getLearningDashboardAccessToken();
  if (learningDashboardAccessToken !== null) {
    const cookieExpiresDate = new Date();
    cookieExpiresDate.setTime(cookieExpiresDate.getTime() + (3600000 * 24 * 30)); // keep cookie 30d
    document.cookie = `learningDashboardAccessToken-${Auth.meetingID}=${getLearningDashboardAccessToken()}; expires=${cookieExpiresDate.toGMTString()}; path=/`;
    return true;
  }
  return false;
};

const openLearningDashboardUrl = (lang) => {
  if (getLearningDashboardAccessToken() && setLearningDashboardCookie()) {
    window.open(`/learning-dashboard/?meeting=${Auth.meetingID}&lang=${lang}`, '_blank');
  } else {
    window.open(`/learning-dashboard/?meeting=${Auth.meetingID}&sessionToken=${Auth.sessionToken}&lang=${lang}`, '_blank');
  }
};

export default {
  isModerator,
  isLearningDashboardEnabled,
  getLearningDashboardAccessToken,
  setLearningDashboardCookie,
  openLearningDashboardUrl,
};
