/** 
 * This class includes the different errors thrown throughout all 
 * database functions.
 * 
 * @author Ayden Jones, Bhavana Dakshinamoorthy, Austin Bird
 */
class UserAlreadyExists extends Error {}
class ProblemWithDB extends Error {}
class UserNotFound extends Error {}
class IncorrectPassword extends Error {}
class BeachAlreadyFavorited extends Error {}
class BeachNotPresent extends Error {}
class ZeroNotifications extends Error {}
class ZeroEvents extends Error {}


module.exports = {
    // Error declarations
    UserAlreadyExists: UserAlreadyExists,
	ProblemWithDB: ProblemWithDB,
	UserNotFound: UserNotFound,
	IncorrectPassword: IncorrectPassword,
	BeachAlreadyFavorited: BeachAlreadyFavorited,
	BeachNotPresent: BeachNotPresent,
  ZeroNotifications: ZeroNotifications,
	ZeroEvents: ZeroEvents,
};
