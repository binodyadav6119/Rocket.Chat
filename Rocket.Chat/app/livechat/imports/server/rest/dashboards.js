import {
	Match,
	check
} from 'meteor/check';

import {
	API
} from '../../../../api/server';
import {
	hasPermission
} from '../../../../authorization/server';
import {
	findAllChatsStatus,
	getProductivityMetrics,
	getConversationsMetrics,
	findAllChatMetricsByAgent,
	findAllAgentsStatus,
	findAllChatMetricsByDepartment,
	findAllResponseTimeMetrics,
	getAgentsProductivityMetrics,
	getChatsMetrics,
} from '../../../server/lib/analytics/dashboards';
import {
	Users
} from '../../../../models';
import {
	removeAllHooks
} from 'dompurify';
import {
	endOfSecond
} from 'date-fns';

API.v1.addRoute('livechat/analytics/dashboards/conversation-totalizers', {
	authRequired: true
}, {
	get() {

		if (!hasPermission(this.userId, 'view-livechat-manager')) {
			return API.v1.unauthorized();
		}
		let {
			start,
			end
		} = this.requestParams();
		const {
			departmentId
		} = this.requestParams();

		var {
			type
		} = this.requestParams();
		const {
			summary
		} = this.requestParams();




		check(start, Match.Maybe(String));
		check(end, Match.Maybe(String));

		check(departmentId, Match.Maybe(String));

		check(type, Match.Maybe(String));
		check(summary, Match.Maybe(String));



		if (type == undefined) {
			type = "department";
		}
		if (start != undefined && end != undefined && summary == undefined) {
			//console.log("bh");
			start = new Date(start);
			end = new Date(end);
			const user = Users.findOneById(this.userId, {
				fields: {
					utcOffset: 1,
					language: 1
				}
			});

			const totalizers = getConversationsMetrics({
				start,
				end,
				departmentId,
				type,
				user
			});

			return API.v1.success(totalizers);
		} else if (start == undefined && end == undefined && summary != undefined) {
			if (summary == "daily") {
				var start1 = new Date();
				start1.setUTCHours(0, 0, 0, 0);


				var end1 = new Date();
				end1.setUTCHours(23, 59, 59, 999);
				const user = Users.findOneById(this.userId, {
					fields: {
						utcOffset: 1,
						language: 1
					}
				});

				const totalizers3 = getConversationsMetrics({
					"start": start1,
					"end": end1,
					departmentId,
					type,
					user
				});

				return API.v1.success(totalizers3);

			} else if (summary == "weekly") {
				var curr = new Date(); // get current date
				var first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week
				var last = first + 6; // last day is the first day + 6

				var firstday = new Date(curr.setDate(first)).toUTCString();
				var lastday = new Date(curr.setDate(last)).toUTCString();
				var start1 = new Date(firstday);
				var end1 = new Date(lastday);
				start1.setUTCHours(0, 0, 0, 0);
				end1.setUTCHours(23, 59, 59, 999);
				const user = Users.findOneById(this.userId, {
					fields: {
						utcOffset: 1,
						language: 1
					}
				});


				const totalizers3 = getConversationsMetrics({
					"start": start1,
					"end": end1,
					departmentId,
					type,
					user
				});
				return API.v1.success(totalizers3);

			} else if (summary == "monthly") {
				var date = new Date();
				var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
				firstDay = addDays(firstDay, 1);
				firstDay.setUTCHours(0, 0, 0, 0);

				var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
				var end1 = lastDay;
				end1.setUTCHours(23, 59, 59, 999);

				var start1 = firstDay;

				start1.setUTCHours(0, 0, 0, 0);
				var year1 = firstDay.getFullYear();
				var month1 = firstDay.getMonth() + 1;
				var daysInMonth1 = new Date(year1, month1, 0).getDate();
				if (daysInMonth1 == 30 || daysInMonth1 == 28) {
					lastDay = addDays(lastDay, 1);
				} else if (daysInMonth1 == 31 || daysInMonth1 == 29) {
					lastDay = addDays(lastDay, 1);
				}
				lastDay.setUTCHours(23, 59, 59, 999);

				const user = Users.findOneById(this.userId, {
					fields: {
						utcOffset: 1,
						language: 1
					}
				});

				const totalizers3 = getConversationsMetrics({
					"start": firstDay,
					"end": lastDay,
					departmentId,
					type,
					user
				});

				return API.v1.success(totalizers3);

			}
		} else if (start != undefined && end != undefined && summary != undefined) {

			start = new Date(start);
			start.setUTCHours(0, 0, 0, 0);

			end = new Date(end);
			end.setUTCHours(23, 59, 59, 999);
			if (summary == "daily") {

				// start.setUTCHours(0,0,0,0);
				// end.setUTCHours(23,59,59,999);
				const diffInMs = end - start;
				const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

				var start1 = new Date(start);
				var end1 = new Date(start1);;

				end1.setUTCHours(23, 59, 59, 999);


				let days = Math.round(diffInDays);

				var a = "day";
				var i = 1;
				const result = {};

				const user = Users.findOneById(this.userId, {
					fields: {
						utcOffset: 1,
						language: 1
					}
				});
				if (days == 1) {

					var year2 = start.getFullYear();
					var month2 = start.getMonth() + 1;
					var day2 = start.getDate();

					const totalizers4 = getConversationsMetrics({
						"start": start,
						"end": end,
						departmentId,
						type,
						user
					});
					var m = `${a}${i}:${year2}-${month2}-${day2}}`;
					result[m] = totalizers4;
					days = days - 1;
					i++;

					return API.v1.success(result);
				} else {

					var year2 = start1.getFullYear();
					var month2 = start1.getMonth() + 1;
					var day2 = start1.getDate();

					const totalizers4 = getConversationsMetrics({
						"start": start1,
						"end": end1,
						departmentId,
						type,
						user
					});
					var m = `${a}${i}:${year2}-${month2}-${day2}`;
					result[m] = totalizers4;
					days = days - 1;
					i++;

				}


				for (let j = 1; j <= days - 1; j++) {

					var start2 = new Date(end1.getTime() + 1);
					var end2 = new Date(start2);

					end2 = end2.toLocaleString();

					end2 = new Date(end2);

					end2.setUTCHours(23, 59, 59, 999);

					var year2 = start2.getFullYear();
					var month2 = start2.getMonth() + 1;
					var day2 = start2.getDate();

					const user = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers3 = getConversationsMetrics({
						"start": start2,
						"end": end2,
						departmentId,
						type,
						user
					});


					var b = `${a}${i}:${year2}-${month2}-${day2}`;

					i++;
					result[b] = totalizers3;

					end1 = end2;



				}
				if (days > 0) {

					var start3 = new Date(end1.getTime() + 1);

					var year2 = start3.getFullYear();
					var month2 = start3.getMonth() + 1;
					var day2 = start3.getDate();

					const user1 = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers5 = getConversationsMetrics({
						"start": start3,
						"end": end,
						departmentId,
						type,
						"user": user1
					});
					var p = `${a}${i}:${year2}-${month2}-${day2}`;
					result[p] = totalizers5;

				}

				return API.v1.success(result);
			} else if (summary == "weekly") {
				// start = new Date(start.getTime()-19800000);
				// end = new Date(end.getTime()-19800000);
				var diffInMs = end - start;
				var diffInDays = diffInMs / (1000 * 60 * 60 * 24);
				var days = Math.round(diffInDays);

				var start1 = start;
				var end1 = end;
				var j = 1;
				var result = {};
				var a = "week";
				var b = start1.getDay();

				var remainderValue;

				if (b == 0) {
					remainderValue = 1;
				} else {
					remainderValue = 7 - b + 1;
				}
				var result = {};
				var end2;
				if (days <= remainderValue) {

					var year2 = start.getFullYear();
					var month2 = start.getMonth() + 1;
					var day2 = start.getDate();
					var year3 = end.getFullYear();
					var month3 = end.getMonth() + 1;
					var day3 = end.getDate() - 1;
					const user = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers5 = getConversationsMetrics({
						"start": start,
						"end": end,
						departmentId,
						type,
						user
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year3}-${month3}-${day3}`;
					result[p] = totalizers5;
					return API.v1.success(result);
				}
				if (days > remainderValue) {
					days = days - remainderValue;
					end2 = getNextDayOfWeek(start, 0);
					end2.setUTCHours(23, 59, 59, 999);

					var year2 = start1.getFullYear();
					var month2 = start1.getMonth() + 1;
					var day2 = start1.getDate();
					var year3 = end2.getFullYear();
					var month3 = end2.getMonth() + 1;
					var day3 = end2.getDate() - 1;
					const user = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers5 = getConversationsMetrics({
						"start": start1,
						"end": end2,
						departmentId,
						type,
						user
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year3}-${month3}-${day3}`;
					j++;
					result[p] = totalizers5;


				}
				var chunks = days / 7;
				for (var i = 1; i <= chunks; i++) {
					var start2 = end2;
					start2 = new Date(start2.getTime() + 1);
					var end3 = new Date(start2.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);

					var year2 = start2.getFullYear();
					var month2 = start2.getMonth() + 1;
					var day2 = start2.getDate();
					var year3 = end3.getFullYear();
					var month3 = end3.getMonth() + 1;
					var day3 = end3.getDate() - 1;
					const user = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers5 = getConversationsMetrics({
						"start": start2,
						"end": end3,
						departmentId,
						type,
						user
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year3}-${month3}-${day3}`;
					j++;
					result[p] = totalizers5;

					end2 = end3;

				}
				if (days % 7 != 0) {
					var start3 = new Date(end2.getTime() + 1);

					var year2 = start3.getFullYear();
					var month2 = start3.getMonth() + 1;
					var day2 = start3.getDate();
					var year3 = end.getFullYear();
					var month3 = end.getMonth() + 1;
					var day3 = end.getDate() - 1;
					const user = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers5 = getConversationsMetrics({
						"start": start3,
						"end": end,
						departmentId,
						type,
						user
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year3}-${month3}-${day3}`; //`${a}${j}${start3}${end}`;
					j++;
					result[p] = totalizers5;
					return API.v1.success(result);

				} else {
					return API.v1.success(result);
				}


			} else if (summary == "monthly") {
				// start = new Date(start.getTime()-19800000);
				// end = new Date(end.getTime()-19800000);
				var diffInMs = end - start;
				var diffInDays = diffInMs / (1000 * 60 * 60 * 24);
				var days = Math.round(diffInDays);

				var start1 = start;
				var end1 = end;
				var j = 1;
				var result = {};
				var a = "month";
				var b = start1.getDate();
				var year = start1.getFullYear();
				var month = start1.getMonth() + 1;
				var daysInMonth = new Date(year, month, 0).getDate();

				var remainderValue = daysInMonth - b + 1;
				var result = {};
				var end2;
				if (days <= remainderValue) {


					var year2 = start.getFullYear();
					var month2 = start.getMonth() + 1;
					var day2 = start.getDate();
					var year3 = end.getFullYear();
					var month3 = end.getMonth() + 1;
					var day3 = end.getDate();
					var daysInMonth1 = new Date(year2, month2, 0).getDate();
					const user = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers5 = getConversationsMetrics({
						"start": start,
						"end": end,
						departmentId,
						type,
						user
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year2}-${month2}-${daysInMonth1}`;
					result[p] = totalizers5;
					return API.v1.success(result);
				}
				if (days > remainderValue) {

					days = days - remainderValue;


					var year1 = start.getFullYear();
					var month1 = start.getMonth() + 1;
					var daysInMonth1 = new Date(year1, month1, 0).getDate();

					var b = start.getDate();
					end2 = new Date(start1.getFullYear(), start1.getMonth() + 1, 0);

					// end2 =  new Date(start.getTime()+(daysInMonth1-b)*24*60*60*1000-1);
					end2.setUTCHours(23, 59, 59, 999);
					if (daysInMonth1 == 30 || daysInMonth1 == 28) {
						end2 = addDays(end2, 1);
					} else if (daysInMonth1 == 31 || daysInMonth1 == 29) {
						end2 = addDays(end2, 1);
					}
					//end2 = new Date(end2.getTime()-19800000);

					var year2 = start1.getFullYear();
					var month2 = start1.getMonth() + 1;
					var day2 = start1.getDate();
					var year3 = end2.getFullYear();
					var month3 = end2.getMonth() + 1;
					var day3 = end2.getDate();
					const user = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers5 = getConversationsMetrics({
						"start": start1,
						"end": end2,
						departmentId,
						type,
						user
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year2}-${month2}-${daysInMonth1}`;
					j++;
					result[p] = totalizers5;


				}
				var chunks = monthDiff(start1, end);
				for (var i = 1; i < chunks; i++) {
					var start2 = end2;
					start2 = new Date(start2.getTime() + 1);
					var year = start2.getFullYear();
					var month = start2.getMonth() + 1;
					var daysInMonth = new Date(year, month, 0).getDate();
					var end3 = new Date(start2.getTime() + daysInMonth * 24 * 60 * 60 * 1000 - 1);

					var year2 = start2.getFullYear();
					var month2 = start2.getMonth() + 1;
					var day2 = start2.getDate();
					var year3 = end3.getFullYear();
					var month3 = end3.getMonth() + 1;
					var day3 = end3.getDate();

					const user = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers5 = getConversationsMetrics({
						"start": start2,
						"end": end3,
						departmentId,
						type,
						user
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year2}-${month2}-${daysInMonth}`;
					j++;
					result[p] = totalizers5;

					end2 = end3;

				}
				if (chunks) {

					var start3 = new Date(end2.getTime() + 1);

					var year2 = start3.getFullYear();
					var month2 = start3.getMonth() + 1;
					var day2 = start3.getDate();
					var year3 = end.getFullYear();
					var month3 = end.getMonth() + 1;
					var day3 = end.getDate() - 1;
					var daysInMonth = new Date(year2, month2, 0).getDate();
					const user = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers5 = getConversationsMetrics({
						"start": start3,
						"end": end,
						departmentId,
						type,
						user
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year2}-${month2}-${day3}`; //`${a}${j}${start3}${end}`;
					j++;
					result[p] = totalizers5;


				}
				return API.v1.success(result);
			}
		} else {
			const user = Users.findOneById(this.userId, {
				fields: {
					utcOffset: 1,
					language: 1
				}
			});
			const totalizers = getConversationsMetrics({
				start,
				end,
				departmentId,
				type,
				user
			});

			return API.v1.success(totalizers);
		}

	},

});

function monthDiff(d1, d2) {
	var months;
	months = (d2.getFullYear() - d1.getFullYear()) * 12;
	months -= d1.getMonth();
	months += d2.getMonth();
	return months <= 0 ? 0 : months;
}

function addDays(date, days) {
	const copy = new Date(Number(date))
	copy.setDate(date.getDate() + days)
	return copy
}

function subDays(date, days) {
	const copy = new Date(Number(date))
	copy.setDate(date.getDate() - days)
	return copy
}

function getNextDayOfWeek(date, dayOfWeek) {
	// Code to check that date and dayOfWeek are valid left as an exercise ;)

	var resultDate = new Date(date.getTime());

	resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);

	return resultDate;
}

API.v1.addRoute('livechat/analytics/dashboards/agents-productivity-totalizers', {
	authRequired: true
}, {
	get() {
		if (!hasPermission(this.userId, 'view-livechat-manager')) {
			return API.v1.unauthorized();
		}
		let {
			start,
			end
		} = this.requestParams();
		const {
			departmentId
		} = this.requestParams();

		var {
			type
		} = this.requestParams();
		const {
			summary
		} = this.requestParams();




		check(start, Match.Maybe(String));
		check(end, Match.Maybe(String));

		check(departmentId, Match.Maybe(String));

		check(type, Match.Maybe(String));
		check(summary, Match.Maybe(String));



		if (type == undefined) {
			type = "department";
		}
		if (start != undefined && end != undefined && summary == undefined) {
			//console.log("bh");
			start = new Date(start);
			end = new Date(end);
			const user = Users.findOneById(this.userId, {
				fields: {
					utcOffset: 1,
					language: 1
				}
			});

			const totalizers = getAgentsProductivityMetrics({
				start,
				end,
				departmentId,
				type,
				user
			});

			return API.v1.success(totalizers);
		} else if (start == undefined && end == undefined && summary != undefined) {
			if (summary == "daily") {
				var start1 = new Date();
				start1.setUTCHours(0, 0, 0, 0);


				var end1 = new Date();
				end1.setUTCHours(23, 59, 59, 999);
				const user = Users.findOneById(this.userId, {
					fields: {
						utcOffset: 1,
						language: 1
					}
				});

				const totalizers3 = getAgentsProductivityMetrics({
					"start": start1,
					"end": end1,
					departmentId,
					type,
					user
				});

				return API.v1.success(totalizers3);

			} else if (summary == "weekly") {
				var curr = new Date(); // get current date
				var first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week
				var last = first + 6; // last day is the first day + 6

				var firstday = new Date(curr.setDate(first)).toUTCString();
				var lastday = new Date(curr.setDate(last)).toUTCString();
				var start1 = new Date(firstday);
				var end1 = new Date(lastday);
				start1.setUTCHours(0, 0, 0, 0);
				end1.setUTCHours(23, 59, 59, 999);
				const user = Users.findOneById(this.userId, {
					fields: {
						utcOffset: 1,
						language: 1
					}
				});


				const totalizers3 = getAgentsProductivityMetrics({
					"start": start1,
					"end": end1,
					departmentId,
					type,
					user
				});
				return API.v1.success(totalizers3);

			} else if (summary == "monthly") {
				var date = new Date();
				var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
				firstDay = addDays(firstDay, 1);
				firstDay.setUTCHours(0, 0, 0, 0);

				var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
				var end1 = lastDay;
				end1.setUTCHours(23, 59, 59, 999);

				var start1 = firstDay;

				start1.setUTCHours(0, 0, 0, 0);
				var year1 = firstDay.getFullYear();
				var month1 = firstDay.getMonth() + 1;
				var daysInMonth1 = new Date(year1, month1, 0).getDate();
				if (daysInMonth1 == 30 || daysInMonth1 == 28) {
					lastDay = addDays(lastDay, 1);
				} else if (daysInMonth1 == 31 || daysInMonth1 == 29) {
					lastDay = addDays(lastDay, 1);
				}
				lastDay.setUTCHours(23, 59, 59, 999);

				const user = Users.findOneById(this.userId, {
					fields: {
						utcOffset: 1,
						language: 1
					}
				});

				const totalizers3 = getAgentsProductivityMetrics({
					"start": firstDay,
					"end": lastDay,
					departmentId,
					type,
					user
				});

				return API.v1.success(totalizers3);

			}
		} else if (start != undefined && end != undefined && summary != undefined) {

			start = new Date(start);
			start.setUTCHours(0, 0, 0, 0);

			end = new Date(end);
			end.setUTCHours(23, 59, 59, 999);
			if (summary == "daily") {

				// start.setUTCHours(0,0,0,0);
				// end.setUTCHours(23,59,59,999);
				const diffInMs = end - start;
				const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

				var start1 = new Date(start);
				var end1 = new Date(start1);;

				end1.setUTCHours(23, 59, 59, 999);


				let days = Math.round(diffInDays);

				var a = "day";
				var i = 1;
				const result = {};

				const user = Users.findOneById(this.userId, {
					fields: {
						utcOffset: 1,
						language: 1
					}
				});
				if (days == 1) {

					var year2 = start.getFullYear();
					var month2 = start.getMonth() + 1;
					var day2 = start.getDate();

					const totalizers4 = getAgentsProductivityMetrics({
						"start": start,
						"end": end,
						departmentId,
						type,
						user
					});
					var m = `${a}${i}:${year2}-${month2}-${day2}}`;
					result[m] = totalizers4;
					days = days - 1;
					i++;

					return API.v1.success(result);
				} else {

					var year2 = start1.getFullYear();
					var month2 = start1.getMonth() + 1;
					var day2 = start1.getDate();

					const totalizers4 = getAgentsProductivityMetrics({
						"start": start1,
						"end": end1,
						departmentId,
						type,
						user
					});
					var m = `${a}${i}:${year2}-${month2}-${day2}`;
					result[m] = totalizers4;
					days = days - 1;
					i++;

				}


				for (let j = 1; j <= days - 1; j++) {

					var start2 = new Date(end1.getTime() + 1);
					var end2 = new Date(start2);

					end2 = end2.toLocaleString();

					end2 = new Date(end2);

					end2.setUTCHours(23, 59, 59, 999);

					var year2 = start2.getFullYear();
					var month2 = start2.getMonth() + 1;
					var day2 = start2.getDate();

					const user = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers3 = getAgentsProductivityMetrics({
						"start": start2,
						"end": end2,
						departmentId,
						type,
						user
					});


					var b = `${a}${i}:${year2}-${month2}-${day2}`;

					i++;
					result[b] = totalizers3;

					end1 = end2;



				}
				if (days > 0) {

					var start3 = new Date(end1.getTime() + 1);

					var year2 = start3.getFullYear();
					var month2 = start3.getMonth() + 1;
					var day2 = start3.getDate();

					const user1 = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers5 = getAgentsProductivityMetrics({
						"start": start3,
						"end": end,
						departmentId,
						type,
						"user": user1
					});
					var p = `${a}${i}:${year2}-${month2}-${day2}`;
					result[p] = totalizers5;

				}

				return API.v1.success(result);
			} else if (summary == "weekly") {
				// start = new Date(start.getTime()-19800000);
				// end = new Date(end.getTime()-19800000);
				var diffInMs = end - start;
				var diffInDays = diffInMs / (1000 * 60 * 60 * 24);
				var days = Math.round(diffInDays);

				var start1 = start;
				var end1 = end;
				var j = 1;
				var result = {};
				var a = "week";
				var b = start1.getDay();

				var remainderValue;

				if (b == 0) {
					remainderValue = 1;
				} else {
					remainderValue = 7 - b + 1;
				}
				var result = {};
				var end2;
				if (days <= remainderValue) {

					var year2 = start.getFullYear();
					var month2 = start.getMonth() + 1;
					var day2 = start.getDate();
					var year3 = end.getFullYear();
					var month3 = end.getMonth() + 1;
					var day3 = end.getDate() - 1;
					const user = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers5 = getAgentsProductivityMetrics({
						"start": start,
						"end": end,
						departmentId,
						type,
						user
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year3}-${month3}-${day3}`;
					result[p] = totalizers5;
					return API.v1.success(result);
				}
				if (days > remainderValue) {
					days = days - remainderValue;
					end2 = getNextDayOfWeek(start, 0);
					end2.setUTCHours(23, 59, 59, 999);

					var year2 = start1.getFullYear();
					var month2 = start1.getMonth() + 1;
					var day2 = start1.getDate();
					var year3 = end2.getFullYear();
					var month3 = end2.getMonth() + 1;
					var day3 = end2.getDate() - 1;
					const user = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers5 = getAgentsProductivityMetrics({
						"start": start1,
						"end": end2,
						departmentId,
						type,
						user
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year3}-${month3}-${day3}`;
					j++;
					result[p] = totalizers5;


				}
				var chunks = days / 7;
				for (var i = 1; i <= chunks; i++) {
					var start2 = end2;
					start2 = new Date(start2.getTime() + 1);
					var end3 = new Date(start2.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);

					var year2 = start2.getFullYear();
					var month2 = start2.getMonth() + 1;
					var day2 = start2.getDate();
					var year3 = end3.getFullYear();
					var month3 = end3.getMonth() + 1;
					var day3 = end3.getDate() - 1;
					const user = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers5 = getAgentsProductivityMetrics({
						"start": start2,
						"end": end3,
						departmentId,
						type,
						user
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year3}-${month3}-${day3}`;
					j++;
					result[p] = totalizers5;

					end2 = end3;

				}
				if (days % 7 != 0) {
					var start3 = new Date(end2.getTime() + 1);

					var year2 = start3.getFullYear();
					var month2 = start3.getMonth() + 1;
					var day2 = start3.getDate();
					var year3 = end.getFullYear();
					var month3 = end.getMonth() + 1;
					var day3 = end.getDate() - 1;
					const user = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers5 = getAgentsProductivityMetrics({
						"start": start3,
						"end": end,
						departmentId,
						type,
						user
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year3}-${month3}-${day3}`; //`${a}${j}${start3}${end}`;
					j++;
					result[p] = totalizers5;
					return API.v1.success(result);

				} else {
					return API.v1.success(result);
				}


			} else if (summary == "monthly") {
				// start = new Date(start.getTime()-19800000);
				// end = new Date(end.getTime()-19800000);
				var diffInMs = end - start;
				var diffInDays = diffInMs / (1000 * 60 * 60 * 24);
				var days = Math.round(diffInDays);

				var start1 = start;
				var end1 = end;
				var j = 1;
				var result = {};
				var a = "month";
				var b = start1.getDate();
				var year = start1.getFullYear();
				var month = start1.getMonth() + 1;
				var daysInMonth = new Date(year, month, 0).getDate();

				var remainderValue = daysInMonth - b + 1;
				var result = {};
				var end2;
				if (days <= remainderValue) {


					var year2 = start.getFullYear();
					var month2 = start.getMonth() + 1;
					var day2 = start.getDate();
					var year3 = end.getFullYear();
					var month3 = end.getMonth() + 1;
					var day3 = end.getDate();
					var daysInMonth1 = new Date(year2, month2, 0).getDate();
					const user = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers5 = getAgentsProductivityMetrics({
						"start": start,
						"end": end,
						departmentId,
						type,
						user
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year2}-${month2}-${daysInMonth1}`;
					result[p] = totalizers5;
					return API.v1.success(result);
				}
				if (days > remainderValue) {

					days = days - remainderValue;


					var year1 = start.getFullYear();
					var month1 = start.getMonth() + 1;
					var daysInMonth1 = new Date(year1, month1, 0).getDate();

					var b = start.getDate();
					end2 = new Date(start1.getFullYear(), start1.getMonth() + 1, 0);

					// end2 =  new Date(start.getTime()+(daysInMonth1-b)*24*60*60*1000-1);
					end2.setUTCHours(23, 59, 59, 999);
					if (daysInMonth1 == 30 || daysInMonth1 == 28) {
						end2 = addDays(end2, 1);
					} else if (daysInMonth1 == 31 || daysInMonth1 == 29) {
						end2 = addDays(end2, 1);
					}
					//end2 = new Date(end2.getTime()-19800000);

					var year2 = start1.getFullYear();
					var month2 = start1.getMonth() + 1;
					var day2 = start1.getDate();
					var year3 = end2.getFullYear();
					var month3 = end2.getMonth() + 1;
					var day3 = end2.getDate();
					const user = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers5 = getAgentsProductivityMetrics({
						"start": start1,
						"end": end2,
						departmentId,
						type,
						user
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year2}-${month2}-${daysInMonth1}`;
					j++;
					result[p] = totalizers5;


				}
				var chunks = monthDiff(start1, end);
				for (var i = 1; i < chunks; i++) {
					var start2 = end2;
					start2 = new Date(start2.getTime() + 1);
					var year = start2.getFullYear();
					var month = start2.getMonth() + 1;
					var daysInMonth = new Date(year, month, 0).getDate();
					var end3 = new Date(start2.getTime() + daysInMonth * 24 * 60 * 60 * 1000 - 1);

					var year2 = start2.getFullYear();
					var month2 = start2.getMonth() + 1;
					var day2 = start2.getDate();
					var year3 = end3.getFullYear();
					var month3 = end3.getMonth() + 1;
					var day3 = end3.getDate();

					const user = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers5 = getAgentsProductivityMetrics({
						"start": start2,
						"end": end3,
						departmentId,
						type,
						user
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year2}-${month2}-${daysInMonth}`;
					j++;
					result[p] = totalizers5;

					end2 = end3;

				}
				if (chunks) {

					var start3 = new Date(end2.getTime() + 1);

					var year2 = start3.getFullYear();
					var month2 = start3.getMonth() + 1;
					var day2 = start3.getDate();
					var year3 = end.getFullYear();
					var month3 = end.getMonth() + 1;
					var day3 = end.getDate() - 1;
					var daysInMonth = new Date(year2, month2, 0).getDate();
					const user = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers5 = getAgentsProductivityMetrics({
						"start": start3,
						"end": end,
						departmentId,
						type,
						user
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year2}-${month2}-${day3}`; //`${a}${j}${start3}${end}`;
					j++;
					result[p] = totalizers5;


				}
				return API.v1.success(result);
			}
		} else {
			const user = Users.findOneById(this.userId, {
				fields: {
					utcOffset: 1,
					language: 1
				}
			});
			const totalizers = getAgentsProductivityMetrics({
				start,
				end,
				departmentId,
				type,
				user
			});

			return API.v1.success(totalizers);
		}
		// if (!hasPermission(this.userId, 'view-livechat-manager')) {
		// 	return API.v1.unauthorized();
		// }
		// let { start, end } = this.requestParams();
		// const { departmentId } = this.requestParams();
		// const { type } = this.requestParams();
		// check(start, String);
		// check(end, String);
		// check(departmentId, Match.Maybe(String));

		// if (isNaN(Date.parse(start))) {
		// 	return API.v1.failure('The "start" query parameter must be a valid date.');
		// }
		// start = new Date(start);

		// if (isNaN(Date.parse(end))) {
		// 	return API.v1.failure('The "end" query parameter must be a valid date.');
		// }
		// end = new Date(end);

		// const user = Users.findOneById(this.userId, { fields: { utcOffset: 1, language: 1 } });

		// const totalizers = getAgentsProductivityMetrics({ start, end, departmentId, type, user });
		// return API.v1.success(totalizers);
	},
});

API.v1.addRoute('livechat/analytics/dashboards/chats-totalizers', {
	authRequired: true
}, {
	get() {
		if (!hasPermission(this.userId, 'view-livechat-manager')) {
			return API.v1.unauthorized();
		}
		let {
			start,
			end
		} = this.requestParams();
		const {
			departmentId
		} = this.requestParams();

		var {
			type
		} = this.requestParams();
		const {
			summary
		} = this.requestParams();




		check(start, Match.Maybe(String));
		check(end, Match.Maybe(String));

		check(departmentId, Match.Maybe(String));

		check(type, Match.Maybe(String));
		check(summary, Match.Maybe(String));



		if (type == undefined) {
			type = "department";
		}
		if (start != undefined && end != undefined && summary == undefined) {
			//console.log("bh");
			start = new Date(start);
			end = new Date(end);
			//const user = Users.findOneById(this.userId, { fields: { utcOffset: 1, language: 1 } });

			const totalizers = getChatsMetrics({
				start,
				end,
				departmentId,
				type
			});

			return API.v1.success(totalizers);
		} else if (start == undefined && end == undefined && summary != undefined) {
			if (summary == "daily") {
				var start1 = new Date();
				start1.setUTCHours(0, 0, 0, 0);


				var end1 = new Date();
				end1.setUTCHours(23, 59, 59, 999);
				//const user = Users.findOneById(this.userId, { fields: { utcOffset: 1, language: 1 } });

				const totalizers3 = getChatsMetrics({
					"start": start1,
					"end": end1,
					departmentId,
					type
				});

				return API.v1.success(totalizers3);

			} else if (summary == "weekly") {
				var curr = new Date(); // get current date
				var first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week
				var last = first + 6; // last day is the first day + 6

				var firstday = new Date(curr.setDate(first)).toUTCString();
				var lastday = new Date(curr.setDate(last)).toUTCString();
				var start1 = new Date(firstday);
				var end1 = new Date(lastday);
				start1.setUTCHours(0, 0, 0, 0);
				end1.setUTCHours(23, 59, 59, 999);
				//const user = Users.findOneById(this.userId, { fields: { utcOffset: 1, language: 1 } });


				const totalizers3 = getChatsMetrics({
					"start": start1,
					"end": end1,
					departmentId,
					type
				});
				return API.v1.success(totalizers3);

			} else if (summary == "monthly") {
				var date = new Date();
				var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
				firstDay = addDays(firstDay, 1);
				firstDay.setUTCHours(0, 0, 0, 0);

				var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
				var end1 = lastDay;
				end1.setUTCHours(23, 59, 59, 999);

				var start1 = firstDay;

				start1.setUTCHours(0, 0, 0, 0);
				var year1 = firstDay.getFullYear();
				var month1 = firstDay.getMonth() + 1;
				var daysInMonth1 = new Date(year1, month1, 0).getDate();
				if (daysInMonth1 == 30 || daysInMonth1 == 28) {
					lastDay = addDays(lastDay, 1);
				} else if (daysInMonth1 == 31 || daysInMonth1 == 29) {
					lastDay = addDays(lastDay, 1);
				}
				lastDay.setUTCHours(23, 59, 59, 999);

				//const user = Users.findOneById(this.userId, { fields: { utcOffset: 1, language: 1 } });

				const totalizers3 = getChatsMetrics({
					"start": firstDay,
					"end": lastDay,
					departmentId,
					type
				});

				return API.v1.success(totalizers3);

			}
		} else if (start != undefined && end != undefined && summary != undefined) {

			start = new Date(start);
			start.setUTCHours(0, 0, 0, 0);

			end = new Date(end);
			end.setUTCHours(23, 59, 59, 999);
			if (summary == "daily") {

				// start.setUTCHours(0,0,0,0);
				// end.setUTCHours(23,59,59,999);
				const diffInMs = end - start;
				const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

				var start1 = new Date(start);
				var end1 = new Date(start1);;

				end1.setUTCHours(23, 59, 59, 999);


				let days = Math.round(diffInDays);

				var a = "day";
				var i = 1;
				const result = {};

				//const user = Users.findOneById(this.userId, { fields: { utcOffset: 1, language: 1 } });
				if (days == 1) {

					var year2 = start.getFullYear();
					var month2 = start.getMonth() + 1;
					var day2 = start.getDate();

					const totalizers4 = getChatsMetrics({
						"start": start,
						"end": end,
						departmentId,
						type
					});
					var m = `${a}${i}:${year2}-${month2}-${day2}}`;
					result[m] = totalizers4;
					days = days - 1;
					i++;

					return API.v1.success(result);
				} else {

					var year2 = start1.getFullYear();
					var month2 = start1.getMonth() + 1;
					var day2 = start1.getDate();

					const totalizers4 = getChatsMetrics({
						"start": start1,
						"end": end1,
						departmentId,
						type
					});
					var m = `${a}${i}:${year2}-${month2}-${day2}`;
					result[m] = totalizers4;
					days = days - 1;
					i++;

				}


				for (let j = 1; j <= days - 1; j++) {

					var start2 = new Date(end1.getTime() + 1);
					var end2 = new Date(start2);

					end2 = end2.toLocaleString();

					end2 = new Date(end2);

					end2.setUTCHours(23, 59, 59, 999);

					var year2 = start2.getFullYear();
					var month2 = start2.getMonth() + 1;
					var day2 = start2.getDate();

					//const user = Users.findOneById(this.userId, { fields: { utcOffset: 1, language: 1 } });

					const totalizers3 = getChatsMetrics({
						"start": start2,
						"end": end2,
						departmentId,
						type
					});


					var b = `${a}${i}:${year2}-${month2}-${day2}`;

					i++;
					result[b] = totalizers3;

					end1 = end2;



				}
				if (days > 0) {

					var start3 = new Date(end1.getTime() + 1);

					var year2 = start3.getFullYear();
					var month2 = start3.getMonth() + 1;
					var day2 = start3.getDate();

					//const user1 = Users.findOneById(this.userId, { fields: { utcOffset: 1, language: 1 } });

					const totalizers5 = getChatsMetrics({
						"start": start3,
						"end": end,
						departmentId,
						type
					});
					var p = `${a}${i}:${year2}-${month2}-${day2}`;
					result[p] = totalizers5;

				}

				return API.v1.success(result);
			} else if (summary == "weekly") {
				// start = new Date(start.getTime()-19800000);
				// end = new Date(end.getTime()-19800000);
				var diffInMs = end - start;
				var diffInDays = diffInMs / (1000 * 60 * 60 * 24);
				var days = Math.round(diffInDays);

				var start1 = start;
				var end1 = end;
				var j = 1;
				var result = {};
				var a = "week";
				var b = start1.getDay();

				var remainderValue;

				if (b == 0) {
					remainderValue = 1;
				} else {
					remainderValue = 7 - b + 1;
				}
				var result = {};
				var end2;
				if (days <= remainderValue) {

					var year2 = start.getFullYear();
					var month2 = start.getMonth() + 1;
					var day2 = start.getDate();
					var year3 = end.getFullYear();
					var month3 = end.getMonth() + 1;
					var day3 = end.getDate() - 1;
					//const user = Users.findOneById(this.userId, { fields: { utcOffset: 1, language: 1 } });

					const totalizers5 = getChatsMetrics({
						"start": start,
						"end": end,
						departmentId,
						type
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year3}-${month3}-${day3}`;
					result[p] = totalizers5;
					return API.v1.success(result);
				}
				if (days > remainderValue) {
					days = days - remainderValue;
					end2 = getNextDayOfWeek(start, 0);
					end2.setUTCHours(23, 59, 59, 999);

					var year2 = start1.getFullYear();
					var month2 = start1.getMonth() + 1;
					var day2 = start1.getDate();
					var year3 = end2.getFullYear();
					var month3 = end2.getMonth() + 1;
					var day3 = end2.getDate() - 1;
					//const user = Users.findOneById(this.userId, { fields: { utcOffset: 1, language: 1 } });

					const totalizers5 = getChatsMetrics({
						"start": start1,
						"end": end2,
						departmentId,
						type
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year3}-${month3}-${day3}`;
					j++;
					result[p] = totalizers5;


				}
				var chunks = days / 7;
				for (var i = 1; i <= chunks; i++) {
					var start2 = end2;
					start2 = new Date(start2.getTime() + 1);
					var end3 = new Date(start2.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);

					var year2 = start2.getFullYear();
					var month2 = start2.getMonth() + 1;
					var day2 = start2.getDate();
					var year3 = end3.getFullYear();
					var month3 = end3.getMonth() + 1;
					var day3 = end3.getDate() - 1;
					//const user = Users.findOneById(this.userId, { fields: { utcOffset: 1, language: 1 } });

					const totalizers5 = getChatsMetrics({
						"start": start2,
						"end": end3,
						departmentId,
						type
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year3}-${month3}-${day3}`;
					j++;
					result[p] = totalizers5;

					end2 = end3;

				}
				if (days % 7 != 0) {
					var start3 = new Date(end2.getTime() + 1);

					var year2 = start3.getFullYear();
					var month2 = start3.getMonth() + 1;
					var day2 = start3.getDate();
					var year3 = end.getFullYear();
					var month3 = end.getMonth() + 1;
					var day3 = end.getDate() - 1;
					//const user = Users.findOneById(this.userId, { fields: { utcOffset: 1, language: 1 } });

					const totalizers5 = getChatsMetrics({
						"start": start3,
						"end": end,
						departmentId,
						type
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year3}-${month3}-${day3}`; //`${a}${j}${start3}${end}`;
					j++;
					result[p] = totalizers5;
					return API.v1.success(result);

				} else {
					return API.v1.success(result);
				}


			} else if (summary == "monthly") {
				// start = new Date(start.getTime()-19800000);
				// end = new Date(end.getTime()-19800000);
				var diffInMs = end - start;
				var diffInDays = diffInMs / (1000 * 60 * 60 * 24);
				var days = Math.round(diffInDays);

				var start1 = start;
				var end1 = end;
				var j = 1;
				var result = {};
				var a = "month";
				var b = start1.getDate();
				var year = start1.getFullYear();
				var month = start1.getMonth() + 1;
				var daysInMonth = new Date(year, month, 0).getDate();

				var remainderValue = daysInMonth - b + 1;
				var result = {};
				var end2;
				if (days <= remainderValue) {


					var year2 = start.getFullYear();
					var month2 = start.getMonth() + 1;
					var day2 = start.getDate();
					var year3 = end.getFullYear();
					var month3 = end.getMonth() + 1;
					var day3 = end.getDate();
					var daysInMonth1 = new Date(year2, month2, 0).getDate();
					//const user = Users.findOneById(this.userId, { fields: { utcOffset: 1, language: 1 } });

					const totalizers5 = getChatsMetrics({
						"start": start,
						"end": end,
						departmentId,
						type
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year2}-${month2}-${daysInMonth1}`;
					result[p] = totalizers5;
					return API.v1.success(result);
				}
				if (days > remainderValue) {

					days = days - remainderValue;


					var year1 = start.getFullYear();
					var month1 = start.getMonth() + 1;
					var daysInMonth1 = new Date(year1, month1, 0).getDate();

					var b = start.getDate();
					end2 = new Date(start1.getFullYear(), start1.getMonth() + 1, 0);

					// end2 =  new Date(start.getTime()+(daysInMonth1-b)*24*60*60*1000-1);
					end2.setUTCHours(23, 59, 59, 999);
					if (daysInMonth1 == 30 || daysInMonth1 == 28) {
						end2 = addDays(end2, 1);
					} else if (daysInMonth1 == 31 || daysInMonth1 == 29) {
						end2 = addDays(end2, 1);
					}
					//end2 = new Date(end2.getTime()-19800000);

					var year2 = start1.getFullYear();
					var month2 = start1.getMonth() + 1;
					var day2 = start1.getDate();
					var year3 = end2.getFullYear();
					var month3 = end2.getMonth() + 1;
					var day3 = end2.getDate();
					//const user = Users.findOneById(this.userId, { fields: { utcOffset: 1, language: 1 } });

					const totalizers5 = getChatsMetrics({
						"start": start1,
						"end": end2,
						departmentId,
						type
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year2}-${month2}-${daysInMonth1}`;
					j++;
					result[p] = totalizers5;


				}
				var chunks = monthDiff(start1, end);
				for (var i = 1; i < chunks; i++) {
					var start2 = end2;
					start2 = new Date(start2.getTime() + 1);
					var year = start2.getFullYear();
					var month = start2.getMonth() + 1;
					var daysInMonth = new Date(year, month, 0).getDate();
					var end3 = new Date(start2.getTime() + daysInMonth * 24 * 60 * 60 * 1000 - 1);

					var year2 = start2.getFullYear();
					var month2 = start2.getMonth() + 1;
					var day2 = start2.getDate();
					var year3 = end3.getFullYear();
					var month3 = end3.getMonth() + 1;
					var day3 = end3.getDate();

					//const user = Users.findOneById(this.userId, { fields: { utcOffset: 1, language: 1 } });

					const totalizers5 = getChatsMetrics({
						"start": start2,
						"end": end3,
						departmentId,
						type
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year2}-${month2}-${daysInMonth}`;
					j++;
					result[p] = totalizers5;

					end2 = end3;

				}
				if (chunks) {

					var start3 = new Date(end2.getTime() + 1);

					var year2 = start3.getFullYear();
					var month2 = start3.getMonth() + 1;
					var day2 = start3.getDate();
					var year3 = end.getFullYear();
					var month3 = end.getMonth() + 1;
					var day3 = end.getDate() - 1;
					var daysInMonth = new Date(year2, month2, 0).getDate();
					//const user = Users.findOneById(this.userId, { fields: { utcOffset: 1, language: 1 } });

					const totalizers5 = getChatsMetrics({
						"start": start3,
						"end": end,
						departmentId,
						type
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year2}-${month2}-${day3}`; //`${a}${j}${start3}${end}`;
					j++;
					result[p] = totalizers5;


				}
				return API.v1.success(result);
			}
		} else {
			//const user = Users.findOneById(this.userId, { fields: { utcOffset: 1, language: 1 } });
			const totalizers = getChatsMetrics({
				start,
				end,
				departmentId,
				type
			});

			return API.v1.success(totalizers);
		}
		// if (!hasPermission(this.userId, 'view-livechat-manager')) {
		// 	return API.v1.unauthorized();
		// }
		// let { start, end } = this.requestParams();
		// const { departmentId } = this.requestParams();
		// const { type } = this.requestParams();

		// check(start, String);
		// check(end, String);
		// check(departmentId, Match.Maybe(String));

		// if (isNaN(Date.parse(start))) {
		// 	return API.v1.failure('The "start" query parameter must be a valid date.');
		// }
		// start = new Date(start);

		// if (isNaN(Date.parse(end))) {
		// 	return API.v1.failure('The "end" query parameter must be a valid date.');
		// }
		// end = new Date(end);

		// const totalizers = getChatsMetrics({ start, end, departmentId,type });
		// return API.v1.success(totalizers);
	},
});

API.v1.addRoute('livechat/analytics/dashboards/productivity-totalizers', {
	authRequired: true
}, {
	get() {
		if (!hasPermission(this.userId, 'view-livechat-manager')) {
			return API.v1.unauthorized();
		}
		let {
			start,
			end
		} = this.requestParams();
		const {
			departmentId
		} = this.requestParams();

		var {
			type
		} = this.requestParams();
		const {
			summary
		} = this.requestParams();




		check(start, Match.Maybe(String));
		check(end, Match.Maybe(String));

		check(departmentId, Match.Maybe(String));

		check(type, Match.Maybe(String));
		check(summary, Match.Maybe(String));



		if (type == undefined) {
			type = "department";
		}
		if (start != undefined && end != undefined && summary == undefined) {
			//console.log("bh");
			start = new Date(start);
			end = new Date(end);
			const user = Users.findOneById(this.userId, {
				fields: {
					utcOffset: 1,
					language: 1
				}
			});

			const totalizers = getProductivityMetrics({
				start,
				end,
				departmentId,
				type,
				user
			});

			return API.v1.success(totalizers);
		} else if (start == undefined && end == undefined && summary != undefined) {
			if (summary == "daily") {
				var start1 = new Date();
				start1.setUTCHours(0, 0, 0, 0);


				var end1 = new Date();
				end1.setUTCHours(23, 59, 59, 999);
				const user = Users.findOneById(this.userId, {
					fields: {
						utcOffset: 1,
						language: 1
					}
				});

				const totalizers3 = getProductivityMetrics({
					"start": start1,
					"end": end1,
					departmentId,
					type,
					user
				});

				return API.v1.success(totalizers3);

			} else if (summary == "weekly") {
				var curr = new Date(); // get current date
				var first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week
				var last = first + 6; // last day is the first day + 6

				var firstday = new Date(curr.setDate(first)).toUTCString();
				var lastday = new Date(curr.setDate(last)).toUTCString();
				var start1 = new Date(firstday);
				var end1 = new Date(lastday);
				start1.setUTCHours(0, 0, 0, 0);
				end1.setUTCHours(23, 59, 59, 999);
				const user = Users.findOneById(this.userId, {
					fields: {
						utcOffset: 1,
						language: 1
					}
				});


				const totalizers3 = getProductivityMetrics({
					"start": start1,
					"end": end1,
					departmentId,
					type,
					user
				});
				return API.v1.success(totalizers3);

			} else if (summary == "monthly") {
				var date = new Date();
				var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
				firstDay = addDays(firstDay, 1);
				firstDay.setUTCHours(0, 0, 0, 0);

				var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
				var end1 = lastDay;
				end1.setUTCHours(23, 59, 59, 999);

				var start1 = firstDay;

				start1.setUTCHours(0, 0, 0, 0);
				var year1 = firstDay.getFullYear();
				var month1 = firstDay.getMonth() + 1;
				var daysInMonth1 = new Date(year1, month1, 0).getDate();
				if (daysInMonth1 == 30 || daysInMonth1 == 28) {
					lastDay = addDays(lastDay, 1);
				} else if (daysInMonth1 == 31 || daysInMonth1 == 29) {
					lastDay = addDays(lastDay, 1);
				}
				lastDay.setUTCHours(23, 59, 59, 999);

				const user = Users.findOneById(this.userId, {
					fields: {
						utcOffset: 1,
						language: 1
					}
				});

				const totalizers3 = getProductivityMetrics({
					"start": firstDay,
					"end": lastDay,
					departmentId,
					type,
					user
				});

				return API.v1.success(totalizers3);

			}
		} else if (start != undefined && end != undefined && summary != undefined) {

			start = new Date(start);
			start.setUTCHours(0, 0, 0, 0);

			end = new Date(end);
			end.setUTCHours(23, 59, 59, 999);
			if (summary == "daily") {

				// start.setUTCHours(0,0,0,0);
				// end.setUTCHours(23,59,59,999);
				const diffInMs = end - start;
				const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

				var start1 = new Date(start);
				var end1 = new Date(start1);;

				end1.setUTCHours(23, 59, 59, 999);


				let days = Math.round(diffInDays);

				var a = "day";
				var i = 1;
				const result = {};

				const user = Users.findOneById(this.userId, {
					fields: {
						utcOffset: 1,
						language: 1
					}
				});
				if (days == 1) {

					var year2 = start.getFullYear();
					var month2 = start.getMonth() + 1;
					var day2 = start.getDate();

					const totalizers4 = getProductivityMetrics({
						"start": start,
						"end": end,
						departmentId,
						type,
						user
					});
					var m = `${a}${i}:${year2}-${month2}-${day2}}`;
					result[m] = totalizers4;
					days = days - 1;
					i++;

					return API.v1.success(result);
				} else {

					var year2 = start1.getFullYear();
					var month2 = start1.getMonth() + 1;
					var day2 = start1.getDate();

					const totalizers4 = getProductivityMetrics({
						"start": start1,
						"end": end1,
						departmentId,
						type,
						user
					});
					var m = `${a}${i}:${year2}-${month2}-${day2}`;
					result[m] = totalizers4;
					days = days - 1;
					i++;

				}


				for (let j = 1; j <= days - 1; j++) {

					var start2 = new Date(end1.getTime() + 1);
					var end2 = new Date(start2);

					end2 = end2.toLocaleString();

					end2 = new Date(end2);

					end2.setUTCHours(23, 59, 59, 999);

					var year2 = start2.getFullYear();
					var month2 = start2.getMonth() + 1;
					var day2 = start2.getDate();

					const user = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers3 = getProductivityMetrics({
						"start": start2,
						"end": end2,
						departmentId,
						type,
						user
					});


					var b = `${a}${i}:${year2}-${month2}-${day2}`;

					i++;
					result[b] = totalizers3;

					end1 = end2;



				}
				if (days > 0) {

					var start3 = new Date(end1.getTime() + 1);

					var year2 = start3.getFullYear();
					var month2 = start3.getMonth() + 1;
					var day2 = start3.getDate();

					const user1 = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers5 = getProductivityMetrics({
						"start": start3,
						"end": end,
						departmentId,
						type,
						"user": user1
					});
					var p = `${a}${i}:${year2}-${month2}-${day2}`;
					result[p] = totalizers5;

				}

				return API.v1.success(result);
			} else if (summary == "weekly") {
				// start = new Date(start.getTime()-19800000);
				// end = new Date(end.getTime()-19800000);
				var diffInMs = end - start;
				var diffInDays = diffInMs / (1000 * 60 * 60 * 24);
				var days = Math.round(diffInDays);

				var start1 = start;
				var end1 = end;
				var j = 1;
				var result = {};
				var a = "week";
				var b = start1.getDay();

				var remainderValue;

				if (b == 0) {
					remainderValue = 1;
				} else {
					remainderValue = 7 - b + 1;
				}
				var result = {};
				var end2;
				if (days <= remainderValue) {

					var year2 = start.getFullYear();
					var month2 = start.getMonth() + 1;
					var day2 = start.getDate();
					var year3 = end.getFullYear();
					var month3 = end.getMonth() + 1;
					var day3 = end.getDate() - 1;
					const user = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers5 = getProductivityMetrics({
						"start": start,
						"end": end,
						departmentId,
						type,
						user
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year3}-${month3}-${day3}`;
					result[p] = totalizers5;
					return API.v1.success(result);
				}
				if (days > remainderValue) {
					days = days - remainderValue;
					end2 = getNextDayOfWeek(start, 0);
					end2.setUTCHours(23, 59, 59, 999);

					var year2 = start1.getFullYear();
					var month2 = start1.getMonth() + 1;
					var day2 = start1.getDate();
					var year3 = end2.getFullYear();
					var month3 = end2.getMonth() + 1;
					var day3 = end2.getDate() - 1;
					const user = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers5 = getProductivityMetrics({
						"start": start1,
						"end": end2,
						departmentId,
						type,
						user
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year3}-${month3}-${day3}`;
					j++;
					result[p] = totalizers5;


				}
				var chunks = days / 7;
				for (var i = 1; i <= chunks; i++) {
					var start2 = end2;
					start2 = new Date(start2.getTime() + 1);
					var end3 = new Date(start2.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);

					var year2 = start2.getFullYear();
					var month2 = start2.getMonth() + 1;
					var day2 = start2.getDate();
					var year3 = end3.getFullYear();
					var month3 = end3.getMonth() + 1;
					var day3 = end3.getDate() - 1;
					const user = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers5 = getProductivityMetrics({
						"start": start2,
						"end": end3,
						departmentId,
						type,
						user
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year3}-${month3}-${day3}`;
					j++;
					result[p] = totalizers5;

					end2 = end3;

				}
				if (days % 7 != 0) {
					var start3 = new Date(end2.getTime() + 1);

					var year2 = start3.getFullYear();
					var month2 = start3.getMonth() + 1;
					var day2 = start3.getDate();
					var year3 = end.getFullYear();
					var month3 = end.getMonth() + 1;
					var day3 = end.getDate() - 1;
					const user = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers5 = getProductivityMetrics({
						"start": start3,
						"end": end,
						departmentId,
						type,
						user
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year3}-${month3}-${day3}`; //`${a}${j}${start3}${end}`;
					j++;
					result[p] = totalizers5;
					return API.v1.success(result);

				} else {
					return API.v1.success(result);
				}


			} else if (summary == "monthly") {
				// start = new Date(start.getTime()-19800000);
				// end = new Date(end.getTime()-19800000);
				var diffInMs = end - start;
				var diffInDays = diffInMs / (1000 * 60 * 60 * 24);
				var days = Math.round(diffInDays);

				var start1 = start;
				var end1 = end;
				var j = 1;
				var result = {};
				var a = "month";
				var b = start1.getDate();
				var year = start1.getFullYear();
				var month = start1.getMonth() + 1;
				var daysInMonth = new Date(year, month, 0).getDate();

				var remainderValue = daysInMonth - b + 1;
				var result = {};
				var end2;
				if (days <= remainderValue) {


					var year2 = start.getFullYear();
					var month2 = start.getMonth() + 1;
					var day2 = start.getDate();
					var year3 = end.getFullYear();
					var month3 = end.getMonth() + 1;
					var day3 = end.getDate();
					var daysInMonth1 = new Date(year2, month2, 0).getDate();
					const user = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers5 = getProductivityMetrics({
						"start": start,
						"end": end,
						departmentId,
						type,
						user
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year2}-${month2}-${daysInMonth1}`;
					result[p] = totalizers5;
					return API.v1.success(result);
				}
				if (days > remainderValue) {

					days = days - remainderValue;


					var year1 = start.getFullYear();
					var month1 = start.getMonth() + 1;
					var daysInMonth1 = new Date(year1, month1, 0).getDate();

					var b = start.getDate();
					end2 = new Date(start1.getFullYear(), start1.getMonth() + 1, 0);

					// end2 =  new Date(start.getTime()+(daysInMonth1-b)*24*60*60*1000-1);
					end2.setUTCHours(23, 59, 59, 999);
					if (daysInMonth1 == 30 || daysInMonth1 == 28) {
						end2 = addDays(end2, 1);
					} else if (daysInMonth1 == 31 || daysInMonth1 == 29) {
						end2 = addDays(end2, 1);
					}
					//end2 = new Date(end2.getTime()-19800000);

					var year2 = start1.getFullYear();
					var month2 = start1.getMonth() + 1;
					var day2 = start1.getDate();
					var year3 = end2.getFullYear();
					var month3 = end2.getMonth() + 1;
					var day3 = end2.getDate();
					const user = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers5 = getProductivityMetrics({
						"start": start1,
						"end": end2,
						departmentId,
						type,
						user
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year2}-${month2}-${daysInMonth1}`;
					j++;
					result[p] = totalizers5;


				}
				var chunks = monthDiff(start1, end);
				for (var i = 1; i < chunks; i++) {
					var start2 = end2;
					start2 = new Date(start2.getTime() + 1);
					var year = start2.getFullYear();
					var month = start2.getMonth() + 1;
					var daysInMonth = new Date(year, month, 0).getDate();
					var end3 = new Date(start2.getTime() + daysInMonth * 24 * 60 * 60 * 1000 - 1);

					var year2 = start2.getFullYear();
					var month2 = start2.getMonth() + 1;
					var day2 = start2.getDate();
					var year3 = end3.getFullYear();
					var month3 = end3.getMonth() + 1;
					var day3 = end3.getDate();

					const user = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers5 = getProductivityMetrics({
						"start": start2,
						"end": end3,
						departmentId,
						type,
						user
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year2}-${month2}-${daysInMonth}`;
					j++;
					result[p] = totalizers5;

					end2 = end3;

				}
				if (chunks) {

					var start3 = new Date(end2.getTime() + 1);

					var year2 = start3.getFullYear();
					var month2 = start3.getMonth() + 1;
					var day2 = start3.getDate();
					var year3 = end.getFullYear();
					var month3 = end.getMonth() + 1;
					var day3 = end.getDate() - 1;
					var daysInMonth = new Date(year2, month2, 0).getDate();
					const user = Users.findOneById(this.userId, {
						fields: {
							utcOffset: 1,
							language: 1
						}
					});

					const totalizers5 = getProductivityMetrics({
						"start": start3,
						"end": end,
						departmentId,
						type,
						user
					});
					var p = `${a}${j}:${year2}-${month2}-${day2} to ${year2}-${month2}-${day3}`; //`${a}${j}${start3}${end}`;
					j++;
					result[p] = totalizers5;


				}
				return API.v1.success(result);
			}
		} else {
			const user = Users.findOneById(this.userId, {
				fields: {
					utcOffset: 1,
					language: 1
				}
			});
			const totalizers = getProductivityMetrics({
				start,
				end,
				departmentId,
				type,
				user
			});

			return API.v1.success(totalizers);
		}
		// //console.log("inside productivity totalizers");

		// if (!hasPermission(this.userId, 'view-livechat-manager')) {
		// 	return API.v1.unauthorized();
		// }
		// let { start, end } = this.requestParams();
		// const { departmentId } = this.requestParams();
		// const { type } = this.requestParams();

		// check(start, String);
		// check(end, String);
		// check(departmentId, Match.Maybe(String));

		// if (isNaN(Date.parse(start))) {
		// 	return API.v1.failure('The "start" query parameter must be a valid date.');
		// }
		// start = new Date(start);

		// if (isNaN(Date.parse(end))) {
		// 	return API.v1.failure('The "end" query parameter must be a valid date.');
		// }
		// end = new Date(end);

		// const user = Users.findOneById(this.userId, { fields: { utcOffset: 1, language: 1 } });

		// const totalizers = getProductivityMetrics({ start, end, departmentId, type, user });

		// return API.v1.success(totalizers);
	},
});

API.v1.addRoute('livechat/analytics/dashboards/charts/chats', {
	authRequired: true
}, {
	get() {
		if (!hasPermission(this.userId, 'view-livechat-manager')) {
			return API.v1.unauthorized();
		}
		let {
			start,
			end
		} = this.requestParams();
		const {
			departmentId
		} = this.requestParams();

		check(start, String);
		check(end, String);
		check(departmentId, Match.Maybe(String));

		if (isNaN(Date.parse(start))) {
			return API.v1.failure('The "start" query parameter must be a valid date.');
		}
		start = new Date(start);

		if (isNaN(Date.parse(end))) {
			return API.v1.failure('The "end" query parameter must be a valid date.');
		}
		end = new Date(end);
		const result = findAllChatsStatus({
			start,
			end,
			departmentId
		});

		return API.v1.success(result);
	},
});

API.v1.addRoute('livechat/analytics/dashboards/charts/chats-per-agent', {
	authRequired: true
}, {
	get() {
		if (!hasPermission(this.userId, 'view-livechat-manager')) {
			return API.v1.unauthorized();
		}
		let {
			start,
			end
		} = this.requestParams();
		const {
			departmentId
		} = this.requestParams();
		const {
			type
		} = this.requestParams();

		check(start, String);
		check(end, String);
		check(departmentId, Match.Maybe(String));
		check(type, Match.Maybe(String));

		if (isNaN(Date.parse(start))) {
			return API.v1.failure('The "start" query parameter must be a valid date.');
		}
		start = new Date(start);

		if (isNaN(Date.parse(end))) {
			return API.v1.failure('The "end" query parameter must be a valid date.');
		}
		end = new Date(end);
		const result = findAllChatMetricsByAgent({
			start,
			end,
			departmentId,
			type
		});

		return API.v1.success(result);
	},
});

API.v1.addRoute('livechat/analytics/dashboards/charts/agents-status', {
	authRequired: true
}, {
	get() {
		if (!hasPermission(this.userId, 'view-livechat-manager')) {
			return API.v1.unauthorized();
		}

		const {
			departmentId
		} = this.requestParams();
		check(departmentId, Match.Maybe(String));

		const result = findAllAgentsStatus({
			departmentId
		});

		return API.v1.success(result);
	},
});

API.v1.addRoute('livechat/analytics/dashboards/charts/chats-per-department', {
	authRequired: true
}, {
	get() {
		if (!hasPermission(this.userId, 'view-livechat-manager')) {
			return API.v1.unauthorized();
		}
		let {
			start,
			end
		} = this.requestParams();
		const {
			departmentId
		} = this.requestParams();
		const {
			type
		} = this.requestParams();

		check(start, String);
		check(end, String);
		check(departmentId, Match.Maybe(String));
		check(type, Match.Maybe(String));

		if (isNaN(Date.parse(start))) {
			return API.v1.failure('The "start" query parameter must be a valid date.');
		}
		start = new Date(start);

		if (isNaN(Date.parse(end))) {
			return API.v1.failure('The "end" query parameter must be a valid date.');
		}
		end = new Date(end);
		const result = findAllChatMetricsByDepartment({
			start,
			end,
			departmentId,
			type
		});

		return API.v1.success(result);
	},
});

API.v1.addRoute('livechat/analytics/dashboards/charts/timings', {
	authRequired: true
}, {
	get() {
		if (!hasPermission(this.userId, 'view-livechat-manager')) {
			return API.v1.unauthorized();
		}
		let {
			start,
			end
		} = this.requestParams();
		const {
			departmentId
		} = this.requestParams();
		const {
			type
		} = this.requestParams();

		check(start, String);
		check(end, String);
		check(departmentId, Match.Maybe(String));
		check(type, Match.Maybe(String));

		if (isNaN(Date.parse(start))) {
			return API.v1.failure('The "start" query parameter must be a valid date.');
		}
		start = new Date(start);

		if (isNaN(Date.parse(end))) {
			return API.v1.failure('The "end" query parameter must be a valid date.');
		}
		end = new Date(end);
		const result = findAllResponseTimeMetrics({
			start,
			end,
			departmentId,
			type
		});

		return API.v1.success(result);
	},
});
