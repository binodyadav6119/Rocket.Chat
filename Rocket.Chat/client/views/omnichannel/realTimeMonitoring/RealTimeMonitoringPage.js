import { Box, Select, Margins } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import React, { useRef, useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom';

import AutoCompleteDepartment from '../../../components/AutoCompleteDepartment';
import AutoCompleteAgent from '../../../components/AutoCompleteAgent';
import Page from '../../../components/Page';
import { useTranslation } from '../../../contexts/TranslationContext';
import { getDateRange } from '../../../lib/utils/getDateRange';
import Label from '../components/Label';
import AgentStatusChart from './charts/AgentStatusChart';
import ChatDurationChart from './charts/ChatDurationChart';
import ChatsChart from './charts/ChatsChart';
import ChatsPerAgentChart from './charts/ChatsPerAgentChart';
import ChatsPerDepartmentChart from './charts/ChatsPerDepartmentChart';
import ResponseTimesChart from './charts/ResponseTimesChart';
import AgentsOverview from './overviews/AgentsOverview';
import ChatsOverview from './overviews/ChatsOverview';
import ConversationOverview from './overviews/ConversationOverview';
import ProductivityOverview from './overviews/ProductivityOverview';

const dateRange = getDateRange();

const RealTimeMonitoringPage = () => {
	const t = useTranslation();

	const [reloadFrequency, setReloadFrequency] = useState(5);


	var [department, setDepartment] = useState('');
	//var [agent, setAgent] = useState('');



	console.log(`type is ${typeof(department)}`);
	var departmentParams;
	var type;
	var isAgent = false;
	if(typeof(department)==='object' && department!==null)
	{

		departmentParams = useMemo(
			() => ({
				...(department?.value && { departmentId: department?.value }),
			}),
			[department],
		);
		type = "department";

	}
	else if(typeof(department)==='string' && department!==null)
	{
		if(department)
		{
			console.log("agent id present");
			departmentParams = useMemo(
				() => ({
					departmentId: department,
				}),
				[department],
			);
			type = "agent";
			isAgent = true;

		}
		else
		{
			console.log("agent id not present");
			departmentParams = useMemo(
				() => ({
					departmentId: department,
				}),
				[department],
			);
			type = "department";
		}

	}
	else
	{
		departmentParams = useMemo(
			() => ({
				...(department?.value && { departmentId: department?.value }),
			}),
			[department],
		);
		type = "department";
	}
	console.log(`isAgent${isAgent}`);



	const reloadRef = useRef({});

	// const departmentParams = useMemo(
	// 	() => ({
	// 		...(department?.value && { departmentId: department?.value }),
	// 	}),
	// 	[department],
	// );


	const allParams = useMemo(
		() => ({
			type,
			...departmentParams,
			...dateRange,
		}),
		[departmentParams],
	);


	const reloadCharts = useMutableCallback(() => {
		Object.values(reloadRef.current).forEach((reload) => {
			reload();
		});
	});

	useEffect(() => {
		const interval = setInterval(reloadCharts, reloadFrequency * 1000);
		return () => {
			clearInterval(interval);
		};
	}, [reloadCharts, reloadFrequency]);

	const reloadOptions = useMemo(
		() => [
			[5, <>5 {t('seconds')}</>],
			[10, <>10 {t('seconds')}</>],
			[30, <>30 {t('seconds')}</>],
			[60, <>1 {t('minute')}</>],
		],
		[t],
	);

	// if(type=="department")
	// {
	// 	agent='';

	// }
	// else
	// {

	// 	department='';
	// }
	// handleAgent = () => {
	// 	console.log('this is:', );

	// 		this.setState({onDisplayDepartment: 'none'});
	// 		this.setState({onDisplayAgent: 'flex'});


	//   }
	//   handleDepartment = () => {
	// 	console.log('this is:1');

	// 	this.setState({onDisplayDepartment: 'flex'});
	// 		this.setState({onDisplayAgent: 'none'});
	//   }
	// 	handleAgent = () => {
	// 		useEffect(() => {
	// 			var onDisplayDepartment='none';
	// 			var onDisplayAgent='flex';

	// 		},[department]

	// 		)



	//   }
	var onDisplayDepartment;
			var onDisplayAgent;

	handleAll = () => {
		console.log("insidehandleall");
		onDisplayDepartment='none';
		onDisplayAgent='none';

	}


	console.log(allParams);

	return (
		<Page>
			<Page.Header title={t('Real_Time_Monitoring')}></Page.Header>





				<Page.ScrollableContentWithShadow>

				<Margins block='x4'>
					<Box
						flexDirection='row'
						display='flex'
						justifyContent='space-between'
						alignSelf='center'
						w='full'
					>


						<Box maxWidth='50%' display='flex' mi='x4' flexGrow={1} flexDirection='column'>
							<Label mb='x4'>{t('Agents')}</Label>
							<AutoCompleteAgent
								value={department}
								onChange={setDepartment}
								placeholder={t('All')}
								label={t('All')}
								onlyMyDepartments
							/>
						</Box>
						<Box maxWidth='50%'  value='' display='flex' mi='x4' flexGrow={1} flexDirection='column'>
							<Label mb='x4'>{t('Departments')}</Label>
							<AutoCompleteDepartment
								display='none'
								value={department}
								onChange={setDepartment}
								placeholder={t('All')}
								label={t('All')}
								onPageChange={this.onPageChange}
								onlyMyDepartments

							/>
						</Box>

						<Box maxWidth='50%' display='flex' mi='x4' flexGrow={1} flexDirection='column'>
							<Label mb='x4'>{t('Update_every')}</Label>
							<Select
								options={reloadOptions}
								onChange={useMutableCallback((val) => setReloadFrequency(val))}
								value={reloadFrequency}
							/>
						</Box>
					</Box>
					<Box display='flex' flexDirection='row' w='full' alignItems='stretch' flexShrink={1}>
						<ConversationOverview
							flexGrow={1}
							flexShrink={1}
							width='50%'
							reloadRef={reloadRef}
							params={allParams}
						/>
					</Box>
					<Box display='flex' flexDirection='row' w='full' alignItems='stretch' flexShrink={1}>
						<ChatsChart
							flexGrow={1}
							flexShrink={1}
							width='50%'
							mie='x2'
							reloadRef={reloadRef}
							params={allParams}
						/>
						<ChatsPerAgentChart
							flexGrow={1}
							flexShrink={1}
							width='50%'
							mis='x2'
							reloadRef={reloadRef}
							params={allParams}
						/>
					</Box>
					<Box display='flex' flexDirection='row' w='full' alignItems='stretch' flexShrink={1}>
						<ChatsOverview
							flexGrow={1}
							flexShrink={1}
							width='50%'
							reloadRef={reloadRef}
							params={allParams}
						/>
					</Box>
					<Box display='flex' flexDirection='row' w='full' alignItems='stretch' flexShrink={1}>
						<AgentStatusChart
							flexGrow={1}
							flexShrink={1}
							width='50%'
							mie='x2'
							reloadRef={reloadRef}
							params={allParams}
						/>
						<ChatsPerDepartmentChart
							flexGrow={1}
							flexShrink={1}
							width='50%'
							mis='x2'
							reloadRef={reloadRef}
							params={allParams}
						/>
					</Box>
					<Box display='flex' flexDirection='row' w='full' alignItems='stretch' flexShrink={1}>
						<AgentsOverview flexGrow={1} flexShrink={1} reloadRef={reloadRef} params={allParams} />
					</Box>
					<Box display='flex' w='full' flexShrink={1}>
						<ChatDurationChart
							flexGrow={1}
							flexShrink={1}
							w='100%'
							reloadRef={reloadRef}
							params={allParams}
						/>
					</Box>
					<Box display='flex' flexDirection='row' w='full' alignItems='stretch' flexShrink={1}>
						<ProductivityOverview
							flexGrow={1}
							flexShrink={1}
							reloadRef={reloadRef}
							params={allParams}
						/>
					</Box>
					<Box display='flex' w='full' flexShrink={1}>
						<ResponseTimesChart
							flexGrow={1}
							flexShrink={1}
							w='100%'
							reloadRef={reloadRef}
							params={allParams}
						/>
					</Box>
				</Margins>
			</Page.ScrollableContentWithShadow>
		</Page>
	);
};

export default RealTimeMonitoringPage;
