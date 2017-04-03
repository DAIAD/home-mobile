var applicationLabels = (function(){
                         
                         return {
                         
                         notificationsAlerts : {
                            spanish : {
                                pair:'¡Error! Inserta el código 1 y 2 de nuevo por favor',
                                device_exists :'¡Error! El dispositivo ya existe',
                                login_error :'Error de autenticación! ¿Ha introducido su nombre de usuario y contraseña correctamente ?',
                                error_registration :'¡Error en el registro! No estás autorizado para utilizar DAIAD. Por favor, contacta con contact@daiad.eu',
                                network_error :'Conecta el Wi-Fi o los Datos móviles por favor! DAIAD requiere conectividad a Internet',
                                device_disconnect:'¿Quieres desconectarte del dispositivo?',
                                server_not_responding :'¡Error! Por favor,Inténtelo de nuevo más tarde o contacta con contact@daiad.eu',
                                invalid_pin : 'Inválido PIN',
                                pin_used : 'PIN ha sido usado. Por favor, iniciar sesión.',
                                reset : 'Tu contraseña ha sido cambiada. Por favor, iniciar sesión!',
                                pass_changed : '¡Su contraseña ha sido guardada con éxito!'
                         
                            },
                            english : {
                                pair:'Pairing failed! Please, enter CODE 1 and CODE 2 again',
                                device_exists :'Something went wrong! Please try again later or send us an email at contact@daiad.eu with the server message',
                                login_error :'Authentication failed! Did you enter your username and password correctly?',
                                error_registration :'Something went wrong! Please try again later or send us an email at contact@daiad.eu with the server message',
                                network_error :'Please enable Wi-Fi or cellular data, DAIAD requires internet connectivity!',
                                device_disconnect:'',
                                server_not_responding :'Something went wrong!Please try again later or send us an email at contact@daiad.eu with the server message',
                                invalid_pin : 'Invalid PIN',
                                pin_used : 'PIN has been used. Please, Sign in.',
                                reset : 'Your password has been changed. Please, Sign in!',
                                pass_changed : 'Your password has been succesfully changed!'
                            }
                         },
                         
                         getConsumptionLabels : function(country){
                         
                            var labels = {
                                volume : {},
                                flow :{},
                                temperature :{},
                                energy :{},
                                currency : {},
                                duration : {},
                                counter :{}
                            };
                         
                         if(country === 'United Kingdom') {
                         
                         labels.volume.long = 'Gallons';
                         labels.volume.short = 'gl';
                         labels.flow.long = 'Gallons/Minutes';
                         labels.flow.short = 'gl/mins';
                         labels.temperature.name = 'Temperature';
                         labels.temperature.long = 'Fahrenheit';
                         labels.temperature.short = 'F';
                         labels.currency.long = 'Pounds';
                         labels.currency.short = '£';
                         labels.energy.long ='Watt';
                         labels.energy.short = 'W';
                         labels.energy.kwh = 'kWh';
                         labels.duration.long = 'Minutes';
                         labels.duration.short = 'min';
                         labels.best = 'New best shower';
                         labels.this_shower ='This shower';
                         labels.counter.stop_2 = 'Or just End the shower manually';
                         labels.counter.stop_1 = 'The counter will stop automatically';
                         labels.week = 'Week';
                         labels.budget_reached = 'Budget reached';
                         labels.max_hour ='Maximum hour';
                         labels.min_hour='Minimum hour';
                         labels.max_day ='Maximum day';
                         labels.min_day ='Minimum day';
                         labels.max_week ='Maximum week';
                         labels.min_week ='Minimum week';
                         labels.max_month ='Maximum month';
                         labels.min_month ='Minimum month';
                         labels.shower ='SHOWER';
                         labels.meter ='METER';
                         labels.change ='Change';
                         labels.other ='Other';
                         labels.current ='Current shower';
                         labels.male ='MALE';
                         labels.female ='FEMALE';
                         labels.remaining = 'remaining';
                         labels.back = 'back';
                         labels.max = 'MAXIMUM';
                         labels.best = 'BEST';
                         labels.home = 'MY HOME';
                         labels.average = 'AVERAGE';
                         labels.price = 'Price until';
                         labels.load_more = 'Load more';
                         
                         } else if(country === 'Spain') {
                         
                         labels.volume.long = 'Litros';
                         labels.volume.short = 'lt';
                         labels.flow.long = 'Litros/Minutos';
                         labels.flow.short = 'lt/min';
                         labels.temperature.name = 'Temperatura';
                         labels.temperature.long = 'Celsius';
                         labels.temperature.short = 'ºC';
                         labels.energy.long ='Watt';
                         labels.energy.short = 'W';
                         labels.energy.kwh = 'kWh';
                         labels.currency.long = 'Euro';
                         labels.currency.short = '€';
                         labels.duration.long = 'Minutos';
                         labels.duration.short = 'min';
                         labels.best = 'Mejor ducha';
                         labels.this_shower ='Esta ducha';
                         labels.counter.stop_2 = 'O simplemente poner fin a la ducha manual';
                         labels.counter.stop_1 = 'El contador se detendrá automáticamente';
                         labels.week = 'Semana';
                         labels.budget_reached = 'Presupuesto alcanzó';
                         labels.max_hour =' Hora de máximo consumo';
                         labels.min_hour='Hora de mínimo consumo';
                         labels.max_day =' Día de máximo consumo';
                         labels.min_day =' Día de mínimo consumo';
                         labels.max_week ='Semana de máximo consumo';
                         labels.min_week ='Semana de mínimo consumo';
                         labels.max_month ='Mes de máximo consumo';
                         labels.min_month ='Mes de mínimo consumo';
                         labels.shower ='DUCHA';
                         labels.meter ='TELELECTURA';
                         labels.change ='Cambiar';
                         labels.other ='Otras';
                         labels.current ='Evento en curso';
                         labels.male ='Hombre';
                         labels.female ='Mujer';
                         labels.remaining = 'restante';
                         labels.back = 'Hecho';
                         labels.max = 'MÁXIMO';
                         labels.best = 'MEJOR';
                         labels.home = 'MI HOGAR';
                         labels.average = 'MI PRO.';
                         labels.price = 'Precio hasta';
                         labels.load_more = 'Carga más';
                         
                         } else {
                         
                         labels.volume.long = 'Liters';
                         labels.volume.short = 'lt';
                         labels.flow.long = 'Liters/Minutes';
                         labels.flow.short = 'lt/min';
                         labels.temperature.name = 'Temperature';
                         labels.temperature.long = 'Celsius';
                         labels.temperature.short = 'ºC';
                         labels.energy.long ='Watt';
                         labels.energy.short = 'w';
                         labels.energy.kwh = 'kWh';
                         labels.currency.long = 'Euro';
                         labels.currency.short = '€';
                         labels.duration.long = 'Minutes';
                         labels.duration.short = 'min';
                         labels.best = 'New best shower';
                         labels.this_shower ='This shower';
                         labels.counter.stop_2 = 'Or just End the shower manually';
                         labels.counter.stop_1 = 'The counter will stop automatically';
                         labels.week = 'Week';
                         labels.budget_reached = 'Budget reached';
                         labels.max_hour ='Maximum hour';
                         labels.min_hour='Minimum hour';
                         labels.max_day ='Maximum day';
                         labels.min_day ='Minimum day';
                         labels.max_week ='Maximum week';
                         labels.min_week ='Minimum week';
                         labels.max_month ='Maximum month';
                         labels.min_month ='Minimum month';
                         labels.shower ='SHOWER';
                         labels.meter ='METER';
                         labels.change ='Change';
                         labels.other ='Other';
                         labels.current ='Current shower';
                         labels.male ='MALE';
                         labels.female ='FEMALE';
                         labels.remaining = 'remaining';
                         labels.back = 'Back';
                         labels.max = 'MAXIMUM';
                         labels.best = 'BEST';
                         labels.home = 'MY HOME';
                         labels.average = 'AVERAGE';
                         labels.price = 'Price until';
                         labels.load_more = 'Load more';
                         
                         }
                         
                         return labels;
                         
                         },
                         
                         comparison : function(country){
                            var labels = {
                                city : null,
                                similar : null,
                                me : null,
                                shower :null,
                                machine :null,
                                toilet :null,
                                other :null,
                                legend : {
                                    similar :null,
                                    yours : null
                                }
                            };
                         
                            if(country == 'Spain') {
                         
                                labels.similar = 'Hog. Similares';
                                labels.city = 'Ciudad';
                                labels.me = 'Yo';
                                labels.shower ='Ducha';
                                labels.machine ='Lavadora';
                                labels.toilet='Baño';
                                labels.other='Otro';
                                labels.legend.similar = 'Similares';
                                labels.legend.yours = 'Tuya';
                         
                            } else {
                         
                                labels.similar = 'Similar homes';
                                labels.city = 'City';
                                labels.me = 'Me';
                                labels.shower ='Shower';
                                labels.machine ='Washing Machine';
                                labels.toilet='Toilet';
                                labels.other='Other';
                                labels.legend.similar = 'Similar';
                                labels.legend.yours = 'Yours';
                         
                            }
                         
                            return labels;
                         }
                         
                         };
                         
                         }
                         )();
