define(['underscore', 'knockout', 'arches', 'utils/report','bindings/datatable'], function(_, ko, arches, reportUtils) {
    return ko.components.register('views/components/reports/scenes/existence', {
        viewModel: function(params) {
            var self = this;
            Object.assign(self, reportUtils);

            self.nameTableConfig = {
                ...self.defaultTableConfig,
                columns: Array(4).fill(null)
            };

            self.identifierTableConfig = {
                ...self.defaultTableConfig,
                columns: Array(3).fill(null)
            };            
            
            self.statementsTableConfig = {
                ...self.defaultTableConfig,
                columns: Array(5).fill(null)
            };

            self.productionTableConfig = {
                ...self.defaultTableConfig,
                columns: Array(7).fill(null)
            };

            self.dataConfig = {
                production: 'production',
            }

            self.cards = Object.assign({}, params.cards);
            self.edit = params.editTile || self.editTile;
            self.delete = params.deleteTile || self.deleteTile;
            self.add = params.addTile || self.addNewTile;
            self.events = params.events || ['production']
            self.eventDataArray = {};
            self.visible = {
                production: ko.observable(true),
                event: ko.observable(true)
            }
            Object.assign(self.dataConfig, params.dataConfig || {});

            const extractEventData = (existenceEvent, eventDataSet, dataConfig, rootCardConfig) => {
                if(!eventDataSet){ return []; }
                if (!Array.isArray(eventDataSet)) {eventDataSet = [eventDataSet]}

                const existenceEventConfig = dataConfig.graph;


                return eventDataSet.map(eventData => {
                    const eventObservables = {
                        names: ko.observableArray(),
                        visible: ko.observable(true),
                        identifiers: ko.observableArray(),
                        statements: ko.observableArray(),
                        timespan: ko.observable(),
                        parts: ko.observableArray(),
                        metadata: ko.observableArray()
                    };

                    eventObservables.tileid = eventData?.['@tile_id'];
                    const rootCard = rootCardConfig?.card;

                    if(rootCard) {
                        const subCards = rootCardConfig.subCards;
                        const tileCards = self.createCardDictionary(rootCard.tiles().find(x => x.tileid == eventObservables.tileid)?.cards);
                        if(tileCards){
                            tileCards.name = tileCards?.[subCards.name];
                            tileCards.statement = tileCards?.[subCards.statement];
                            tileCards.timespan = tileCards?.[subCards.timespan];
                            tileCards.identifier = tileCards?.[subCards.identifier];
                            tileCards.part = tileCards?.[subCards.part];
                            eventObservables.cards = tileCards;
                        }
                    }

                    if(eventData) {
                        const eventNamesValue = self.getRawNodeValue(eventData, `${existenceEventConfig}_name`);
                        if(eventNamesValue) {
                            const eventNames = !eventNamesValue.length ? [eventNamesValue] : eventNamesValue; 
                        
                            eventObservables.names(eventNames.map(x => {
                                const name = self.getNodeValue(x, `${existenceEventConfig}_name_content`);
                                const type = self.getNodeValue(x, `${existenceEventConfig}_name_type`);
                                const language = self.getNodeValue(x, `${existenceEventConfig}_name_language`);
                                const tileid = x?.['@tile_id'];
                                return {language, name, tileid, type}
                            }));
                        }

                        const eventIdentifiersValue = self.getRawNodeValue(eventData, `${existenceEventConfig}_identifier`);
                        if(eventIdentifiersValue){
                            const eventIdentifiers = !eventIdentifiersValue.length ? [eventIdentifiersValue] : eventIdentifiersValue; 
                            eventObservables.identifiers(eventIdentifiers.map(x => {
                                const name = self.getNodeValue(x, `${existenceEventConfig}_identifier_content`);
                                const type = self.getNodeValue(x, `${existenceEventConfig}_identifier_type`);
                                const tileid = x?.['@tile_id'];
                                return {name, tileid, type};
                            }));
                        }

                        const eventTime = self.getRawNodeValue(eventData, `${existenceEventConfig}_time`)
                        if(eventTime) {
                            const beginningStart = self.getNodeValue(eventTime, `${existenceEventConfig}_time_begin of the begin`);
                            const beginningComplete = self.getNodeValue(eventTime, `${existenceEventConfig}_time_begin of the end`);
                            const endingStart = self.getNodeValue(eventTime, `${existenceEventConfig}_time_end of the begin`);
                            const endingComplete = self.getNodeValue(eventTime, `${existenceEventConfig}_time_end of the end`);

                            const name = self.getNodeValue(eventTime, {
                                testPaths: [
                                    [
                                        `${existenceEventConfig}_time_name`, 
                                        `${existenceEventConfig}_time_name_content`
                                    ],
                                    [
                                        `${existenceEventConfig}_time_name`, 
                                        0,
                                        `${existenceEventConfig}_time_name_content`
                                    ]
                                ]});
                            const durationValue = self.getNodeValue(eventTime, `${existenceEventConfig}_time_duration`, `${existenceEventConfig}_time_duration_value`);
                            const durationUnit = self.getNodeValue(eventTime, `${existenceEventConfig}_time_duration`, `${existenceEventConfig}_time_duration_unit`);
                            const duration = `${durationValue} ${durationUnit.replace(/\([^()]*\)/g, '')}`

                            const durationEventName = self.getNodeValue(eventTime, {
                                testPaths: [
                                    [`${existenceEventConfig}_time_duration`, 
                                    `${existenceEventConfig}_time_duration_name`, 
                                    `${existenceEventConfig}_time_duration_name_content`],
                                    [`${existenceEventConfig}_time_duration`,
                                    `${existenceEventConfig}_time_duration_name`, 
                                    0,
                                    `${existenceEventConfig}_time_duration_name_content`]
                                ]});
                            eventObservables.timespan({beginningComplete, beginningStart, duration, durationEventName, endingComplete, endingStart, name})
                        }

                        const eventStatementValue = self.getRawNodeValue(eventData, `${existenceEventConfig}_statement`);
                        if(eventStatementValue){
                            const eventStatement = !eventStatementValue.length ? [eventStatementValue] : eventStatementValue
                            eventObservables.statements(eventStatement.map(x => {
                                const content = self.getNodeValue(x, `${existenceEventConfig}_statement_content`);
                                const name = self.getNodeValue(x, `${existenceEventConfig}_statement_name`, `${existenceEventConfig}_statement_name_content`);
                                const type = self.getNodeValue(x, `${existenceEventConfig}_statement_type`);
                                const language = self.getNodeValue(x, `${existenceEventConfig}_statement_language`);
                                const tileid = x?.['@tile_id'];
                                return {content, language, name, tileid, type}
                            }));
                        }

                        const parts = self.getRawNodeValue(eventData, dataConfig?.parts?.graph);
                        if(parts?.length){
                            var partObservables = parts.map(x => {
                                let partKeys = {};
                                if(rootCardConfig?.subCards){
                                    const subKeys = Object.keys(rootCardConfig?.subCards);
                                    let partKeys = JSON.parse(JSON.stringify(rootCardConfig?.subCards));
                                    for(const key of subKeys){
                                        partKeys[key] += " part"
                                    }
                                }
                                const partData = extractEventData(existenceEvent, x, dataConfig.parts, {card: eventObservables?.cards?.part, subCards: partKeys});
                                return {...partData?.[0]}
                            });
                            eventObservables.parts(partObservables);
                        }
                        
                        const existenceEventMetadata = [];
                        for(configuration of dataConfig.metadata){
                            const key = configuration.key;
                            const type = configuration.type;
                            
                            const value = 
                                type == 'resource' ? 
                                    self.getRawNodeValue(eventData, {testPaths: [[configuration.path]]}) : 
                                    self.getNodeValue(eventData, {testPaths: [[configuration.path]]});
                            existenceEventMetadata.push({key, type, value})
                        }
                        eventObservables.metadata(existenceEventMetadata);

                        return eventObservables;
                    }
                })
            }

            // if params.compiled is set and true, the user has compiled their own data.  Use as is.
            if(params?.compiled){
                self.eventDataArray = params.data.eventData;
            } else {
                for(existenceEvent of self.events){
                    self.eventDataArray[existenceEvent] = extractEventData(existenceEvent, self.getRawNodeValue(params.data(), self.dataConfig?.[existenceEvent]?.graph), self.dataConfig?.[existenceEvent], self.cards?.[existenceEvent], params.metadata);
                }
            }
            
        },
        template: { require: 'text!templates/views/components/reports/scenes/existence.htm' }
    });
});