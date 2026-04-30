// 产品、节气、专家数据（从 HTML 版本迁移）
// 保持与原版 P / JIEQI / EXPERTS 一致

const PRODUCT_IMAGES = require('./product-images.js');

const PRODUCTS = {
  easy1: { id:'easy1', cat:'easy', icon:'🌼', name:'单味祁菊花茶包', origin:'河北安国', batch:'BCS-2026-0412-001', price:9.9, unit:'盒（10包）', desc:'安国道地祁菊花，低温烘焙锁香。三角独立茶包，热水即冲即饮，清肝明目，日常轻补首选。', tags:['GAP道地','独立茶包','清肝明目'],
    info:{ '产品名称':'单味祁菊花茶包','原产地':'河北安国','生产日期':'2026-04-10','保质期':'18个月','净含量':'50g (10袋×5g)','认证':'GAP认证 · 有机认证' },
    timeline:[
      { date:'2025年10月',     title:'采收鲜花', desc:'安国祁菊花基地，霜降前后采摘舒展鲜花。',          media:'video', done:true },
      { date:'2026年3月20日',  title:'质量检测', desc:'SGS第三方检测，农残未检出，黄酮含量达标。',       media:'doc',   done:true },
      { date:'2026年4月2日',   title:'烘焙封装', desc:'低温烘焙锁香，三角茶包独立充氮封装。',            media:'video', done:true },
      { date:'2026年4月10日',  title:'出库配送', desc:'常温物流出库，密封防潮包装。',                                  done:false }
    ] },
  easy2: { id:'easy2', cat:'easy', icon:'🌱', name:'即食薏米代餐糕', origin:'河北安国', batch:'BCS-2026-0411-002', price:19.9, unit:'袋（10包）', desc:'安国薏米搭配山药、红豆古法烘焙，一块一餐，健脾利湿，饱腹轻盈，上班族代早餐。', tags:['低GI','独立包装','健脾利湿'],
    info:{ '产品名称':'即食薏米代餐糕','原产地':'河北安国','生产日期':'2026-04-08','保质期':'12个月','净含量':'200g (10块×20g)','认证':'食品安全认证' },
    timeline:[
      { date:'2026年2月28日',  title:'原料采收', desc:'安国薏米、山药基地采收入库，分级筛选。',         media:'video', done:true },
      { date:'2026年3月5日',   title:'质量检测', desc:'重金属、农残全项检测合格，营养成分复核。',        media:'doc',   done:true },
      { date:'2026年3月25日',  title:'烘焙封装', desc:'古法低温烘焙，独立避光封装锁鲜。',                media:'video', done:true },
      { date:'2026年4月8日',   title:'出库配送', desc:'常温物流出库，防潮气密包装。',                                  done:false }
    ] },
  easy3: { id:'easy3', cat:'easy', icon:'🌼', name:'祁菊花枸杞护眼茶包', origin:'河北安国', batch:'BCS-2026-0415-007', price:12.9, unit:'盒（10包）', desc:'祁菊花配宁夏枸杞，专为屏幕族调方。清肝明目，久视疲劳的一杯刚好。', tags:['护眼配方','屏幕族必备','清肝明目'],
    info:{ '产品名称':'祁菊花枸杞护眼茶包','原产地':'河北安国','生产日期':'2026-04-13','保质期':'18个月','净含量':'60g (10袋×6g)','认证':'GAP认证 · 药食同源' },
    timeline:[
      { date:'2025年10月',     title:'采收鲜花', desc:'霜降前舒展鲜花采摘，配宁夏中宁头茬枸杞。',        media:'video', done:true },
      { date:'2026年3月22日',  title:'双料复检', desc:'菊花+枸杞双料农残检测合格。',                     media:'doc',   done:true },
      { date:'2026年4月4日',   title:'配比封装', desc:'黄金配比三角包，充氮锁鲜。',                      media:'video', done:true },
      { date:'2026年4月13日',  title:'出库配送', desc:'独立避光盒装出库。',                                            done:false }
    ] },
  easy4: { id:'easy4', cat:'easy', icon:'🌼', name:'祁菊金银茉莉三花灭火茶', origin:'河北安国', batch:'BCS-2026-0416-008', price:15.9, unit:'盒（10包）', desc:'祁菊花、金银花、茉莉花三花同袋。清热解毒，疏散风热，熬夜上火一包即解。', tags:['三花同袋','清热降火','熬夜回血'],
    info:{ '产品名称':'祁菊金银茉莉三花灭火茶','原产地':'河北安国','生产日期':'2026-04-14','保质期':'18个月','净含量':'60g (10袋×6g)','认证':'GAP认证 · 药食同源' },
    timeline:[
      { date:'2025年10月',     title:'多源采收', desc:'祁菊花、金银花、茉莉花分基地同期采收。',          media:'video', done:true },
      { date:'2026年3月25日',  title:'三料检测', desc:'三味花材逐项检测，重金属农残达标。',                             done:true },
      { date:'2026年4月5日',   title:'三花同拼', desc:'黄金比例调配，三角包独立充氮封装。',              media:'video', done:true },
      { date:'2026年4月14日',  title:'出库发运', desc:'避光密封出库，配冲泡说明。',                                    done:false }
    ] },
  easy5: { id:'easy5', cat:'easy', icon:'🌱', name:'熟制破壁祁薏米粉', origin:'河北安国', batch:'BCS-2026-0417-009', price:15.9, unit:'罐（300g）', desc:'安国祁薏米熟制破壁，细腻即冲即饮。健脾祛湿，加奶加豆浆加粥皆宜。', tags:['熟制破壁','即冲即饮','健脾祛湿'],
    info:{ '产品名称':'熟制破壁祁薏米粉','原产地':'河北安国','生产日期':'2026-04-15','保质期':'12个月','净含量':'300g','认证':'食品安全认证' },
    timeline:[
      { date:'2026年2月',      title:'原料精选', desc:'安国薏米基地分级，选颗粒饱满批次。',              media:'video', done:true },
      { date:'2026年3月10日',  title:'质量检测', desc:'重金属、黄曲霉毒素全项合格。',                                  done:true },
      { date:'2026年4月1日',   title:'熟制破壁', desc:'低温熟制后破壁研磨，细度800目。',                 media:'video', done:true },
      { date:'2026年4月15日',  title:'出库发运', desc:'食品级PET罐充氮封装。',                                          done:false }
    ] },
  easy6: { id:'easy6', cat:'easy', icon:'🌱', name:'祛湿薏米茶包', origin:'河北安国', batch:'BCS-2026-0418-010', price:9.9, unit:'盒（10包）', desc:'祁薏米配赤小豆、茯苓、芡实，一袋即冲。专为湿气重、水肿困倦人群调配。', tags:['四味配方','一袋一杯','健脾祛湿'],
    info:{ '产品名称':'祛湿薏米茶包','原产地':'河北安国','生产日期':'2026-04-16','保质期':'18个月','净含量':'80g (10袋×8g)','认证':'药食同源 · 食品安全认证' },
    timeline:[
      { date:'2026年2月',      title:'四料采收', desc:'薏米、赤小豆、茯苓、芡实分基地同期筹备。',        media:'video', done:true },
      { date:'2026年3月12日',  title:'四料检测', desc:'四味食材批批送检全项合格。',                                    done:true },
      { date:'2026年4月2日',   title:'配方封装', desc:'中医师调方，三角茶包独立封装。',                  media:'video', done:true },
      { date:'2026年4月16日',  title:'出库发运', desc:'避光盒装出库，配冲泡建议。',                                    done:false }
    ] },
  easy7: { id:'easy7', cat:'easy', icon:'🍵', name:'清润沙参茶包', origin:'河北安国', batch:'BCS-2026-0419-011', price:12.9, unit:'盒（10包）', desc:'安国祁沙参切片茶包，润肺养阴，清嗓生津。久咳久讲、秋冬干燥的一杯温柔。', tags:['道地祁沙参','润肺养阴','清嗓生津'],
    info:{ '产品名称':'清润沙参茶包','原产地':'河北安国','生产日期':'2026-04-17','保质期':'18个月','净含量':'60g (10袋×6g)','认证':'GAP认证' },
    timeline:[
      { date:'2025年10月',     title:'采挖分级', desc:'安国祁沙参霜后采挖，按条粗分级。',                media:'video', done:true },
      { date:'2026年3月15日',  title:'质量检测', desc:'硫含量、农残检测合格。',                                        done:true },
      { date:'2026年4月3日',   title:'切片封装', desc:'薄片低温烘干，三角茶包独立封装。',                media:'video', done:true },
      { date:'2026年4月17日',  title:'出库发运', desc:'避光盒装出库。',                                                done:false }
    ] },
  easy8: { id:'easy8', cat:'easy', icon:'🍵', name:'沙参玉竹六物饮', origin:'河北安国', batch:'BCS-2026-0420-012', price:19.9, unit:'盒（10包）', desc:'祁沙参、玉竹、麦冬、百合、陈皮、甘草六物配方，滋阴润肺，养胃生津。一袋一壶。', tags:['六物方','滋阴润肺','养胃生津'],
    info:{ '产品名称':'沙参玉竹六物饮','原产地':'河北安国','生产日期':'2026-04-18','保质期':'18个月','净含量':'100g (10袋×10g)','认证':'药食同源 · GAP认证' },
    timeline:[
      { date:'2025年10月',     title:'六料筹备', desc:'沙参、玉竹、麦冬、百合、陈皮、甘草分产区筹备。', media:'video', done:true },
      { date:'2026年3月18日',  title:'六料检测', desc:'六味中药材全项送检合格。',                                      done:true },
      { date:'2026年4月5日',   title:'配方封装', desc:'中医师坐镇调方，独立茶包锁鲜。',                  media:'video', done:true },
      { date:'2026年4月18日',  title:'出库发运', desc:'礼盒式包装出库，配煎煮说明。',                                  done:false }
    ] },
  home1: { id:'home1', cat:'home', icon:'🌱', name:'罐装祁山药片', origin:'河北安国', batch:'BCS-2026-0410-003', price:15.9, unit:'罐（200g）', desc:'安国祁山药鲜切烘干，片片见筋骨。煲汤、炖粥、煮水均可，健脾益胃，温补家常。', tags:['道地祁山药','鲜切烘干','煲汤炖粥'],
    info:{ '产品名称':'罐装祁山药片','原产地':'河北安国','生产日期':'2026-04-06','保质期':'18个月','净含量':'200g','认证':'GAP认证' },
    timeline:[
      { date:'2025年11月',     title:'采挖分拣', desc:'安国祁山药基地霜后采挖，人工分拣去伤。',          media:'video', done:true },
      { date:'2026年3月10日',  title:'检测合格', desc:'硫含量检测 · 二氧化硫零添加达标。',                              done:true },
      { date:'2026年3月20日',  title:'鲜切烘干', desc:'当日鲜切，低温慢烘保留原香与有效成分。',          media:'video', done:true },
      { date:'2026年4月6日',   title:'出库发运', desc:'食品级PET罐充氮封装出库，配汤方说明。',                          done:false }
    ] },
  home2: { id:'home2', cat:'home', icon:'🍵', name:'家用白芷卤料包', origin:'河北安国', batch:'BCS-2026-0409-004', price:15.9, unit:'袋（10包）', desc:'安国道地白芷为主，配八角、桂皮、山柰等十味香辛料，一包一锅，祛风散寒，家常卤味更香。', tags:['道地白芷','十味配方','一包一锅'],
    info:{ '产品名称':'家用白芷卤料包','原产地':'河北安国','生产日期':'2026-04-05','保质期':'18个月','净含量':'300g (10包×30g)','认证':'药食同源 · 食品安全认证' },
    timeline:[
      { date:'2026年2月',      title:'采收分级', desc:'安国白芷基地采收，按片形筋度分级。',              media:'video', done:true },
      { date:'2026年3月',      title:'检测原料', desc:'十味香辛料批批送检，农残、黄曲霉毒素合格。',                    done:true },
      { date:'2026年3月28日',  title:'配方封装', desc:'中医师坐镇调方，独立小包装便于家用。',            media:'video', done:true },
      { date:'2026年4月5日',   title:'出库质检', desc:'逐袋封口复检，配家常卤方卡片。',                                done:false }
    ] },
  home3: { id:'home3', cat:'home', icon:'🌱', name:'去皮切段祁山药', origin:'河北安国', batch:'BCS-2026-0421-013', price:19.9, unit:'袋（400g）', desc:'安国祁山药现挖现切，去皮分段锁鲜。炖汤款或即食鲜蒸款可选，开袋即用。', tags:['鲜切锁鲜','去皮免削','炖汤鲜蒸'],
    info:{ '产品名称':'去皮切段祁山药','原产地':'河北安国','生产日期':'2026-04-19','保质期':'冷藏15天','净含量':'400g','认证':'GAP认证 · 冷链可追溯' },
    timeline:[
      { date:'2026年4月10日',  title:'当日采挖', desc:'清晨采挖，中午入厂，减少氧化。',                  media:'video', done:true },
      { date:'2026年4月12日',  title:'质量检测', desc:'二氧化硫零添加，微生物菌群合格。',                              done:true },
      { date:'2026年4月15日',  title:'鲜切真空', desc:'去皮切段真空锁鲜包装。',                          media:'video', done:true },
      { date:'2026年4月19日',  title:'冷链出库', desc:'0-4℃冷链物流直达用户。',                                        done:false }
    ] },
  home4: { id:'home4', cat:'home', icon:'🌱', name:'罐装祁山药丁', origin:'河北安国', batch:'BCS-2026-0422-014', price:15.9, unit:'罐（200g）', desc:'祁山药均匀小丁装罐，煮粥、拌饭、做杂粮饭一把即下，快手家常。', tags:['小丁即用','煮粥拌饭','快手家常'],
    info:{ '产品名称':'罐装祁山药丁','原产地':'河北安国','生产日期':'2026-04-20','保质期':'18个月','净含量':'200g','认证':'GAP认证' },
    timeline:[
      { date:'2025年11月',     title:'采挖分拣', desc:'霜后采挖分拣入库。',                              media:'video', done:true },
      { date:'2026年3月12日',  title:'检测合格', desc:'硫含量、水活度达标。',                                          done:true },
      { date:'2026年3月25日',  title:'切丁烘干', desc:'均匀切丁低温慢烘，大小一致。',                    media:'video', done:true },
      { date:'2026年4月20日',  title:'出库发运', desc:'PET罐充氮封装出库。',                                            done:false }
    ] },
  home5: { id:'home5', cat:'home', icon:'🍵', name:'白芷去腥调味粉', origin:'河北安国', batch:'BCS-2026-0423-015', price:9.9, unit:'瓶（100g）', desc:'安国白芷研磨细粉，配少量姜粉与花椒。炖肉、煎鱼、烧汤撒一点，去腥提香更温补。', tags:['细粉即撒','去腥提香','厨房常备'],
    info:{ '产品名称':'白芷去腥调味粉','原产地':'河北安国','生产日期':'2026-04-21','保质期':'18个月','净含量':'100g','认证':'食品安全认证 · 药食同源' },
    timeline:[
      { date:'2026年2月',      title:'白芷精选', desc:'选取粉性足、香气浓的优级白芷。',                  media:'video', done:true },
      { date:'2026年3月8日',   title:'质量检测', desc:'农残、重金属合格，黄曲霉毒素未检出。',                          done:true },
      { date:'2026年4月5日',   title:'研磨配比', desc:'超细研磨，精确配比姜粉、花椒粉。',                media:'video', done:true },
      { date:'2026年4月21日',  title:'出库发运', desc:'玻璃调味瓶避光装出库。',                                        done:false }
    ] },
  spec1: { id:'spec1', cat:'special', icon:'🌼', name:'裹糖冻干祁山药', origin:'河北安国', batch:'BCS-2026-0408-005', price:15.9, unit:'袋（80g）', desc:'安国祁山药冻干锁鲜，外裹薄糖结晶，酥脆不腻，办公追剧的健康小食。', tags:['冻干锁鲜','薄糖低甜','办公零食'],
    info:{ '产品名称':'裹糖冻干祁山药','原产地':'河北安国','生产日期':'2026-04-03','保质期':'9个月','净含量':'80g','认证':'食品安全认证' },
    timeline:[
      { date:'2025年11月',     title:'原料采挖', desc:'安国祁山药基地采挖，选用中段优质部位。',                          done:true },
      { date:'2026年3月15日',  title:'检测安全', desc:'糖度、水活度、微生物全项检测合格。',                              done:true },
      { date:'2026年3月25日',  title:'冻干裹糖', desc:'-40℃真空冻干后薄糖结晶包裹，酥脆不黏。',         media:'video', done:true },
      { date:'2026年4月3日',   title:'出库包装', desc:'氮气锁鲜小袋装出库，随取随吃。',                                done:false }
    ] },
  spec2: { id:'spec2', cat:'special', icon:'🎁', name:'亲民礼盒（八大祁药）', origin:'河北安国', batch:'BCS-2026-0407-006', price:99.9, unit:'盒', desc:'八大祁药各一款：菊花、山药、薏米、沙参、白芷、紫菀、芥穗、玉竹。新中式礼盒，送礼自用皆宜。', tags:['八大祁药','新中式礼盒','亲民之选'],
    info:{ '产品名称':'亲民礼盒（八大祁药）','原产地':'河北安国','生产日期':'2026-04-07','保质期':'12个月','内含':'菊花+山药+薏米+沙参+白芷+紫菀+芥穗+玉竹 各一款','认证':'多项认证' },
    timeline:[
      { date:'2026年4月1日',   title:'八品选组', desc:'八条祁药产品线严选当季最佳批次。',                              done:true },
      { date:'2026年4月5日',   title:'礼盒包装', desc:'手工新中式礼盒，环保竹浆纸材质。',                media:'video', done:true },
      { date:'2026年4月7日',   title:'出库发运', desc:'防震气柱袋出库，配手写贺卡与药典。',                            done:false }
    ] },
  spec3: { id:'spec3', cat:'special', icon:'🌱', name:'祁紫菀超细药用粉', origin:'河北安国', batch:'BCS-2026-0424-016', price:9.9, unit:'袋（200g）', desc:'安国祁紫菀超细研磨，800目药用级细度。润肺下气，煎服、冲泡皆宜。', tags:['道地祁紫菀','800目细粉','润肺下气'],
    info:{ '产品名称':'祁紫菀超细药用粉','原产地':'河北安国','生产日期':'2026-04-22','保质期':'24个月','净含量':'200g','认证':'GMP认证 · 药用级' },
    timeline:[
      { date:'2025年10月',     title:'采挖分级', desc:'安国紫菀基地霜后采挖分级。',                      media:'video', done:true },
      { date:'2026年3月20日',  title:'检测达标', desc:'重金属、农残、灰分全项药典达标。',                media:'doc',   done:true },
      { date:'2026年4月10日',  title:'超细研磨', desc:'800目超细研磨，均匀细腻。',                       media:'video', done:true },
      { date:'2026年4月22日',  title:'出库发运', desc:'食品药品级铝袋避光出库。',                                      done:false }
    ] },
  spec4: { id:'spec4', cat:'special', icon:'🌱', name:'祁芥穗超细药用粉', origin:'河北安国', batch:'BCS-2026-0425-017', price:9.9, unit:'袋（200g）', desc:'安国祁芥穗超细研磨，800目药用级。祛风解表，散寒止痒，外敷内服皆可。', tags:['道地祁芥穗','800目细粉','祛风解表'],
    info:{ '产品名称':'祁芥穗超细药用粉','原产地':'河北安国','生产日期':'2026-04-23','保质期':'24个月','净含量':'200g','认证':'GMP认证 · 药用级' },
    timeline:[
      { date:'2025年9月',      title:'采收分级', desc:'安国芥穗基地花穗期采收。',                        media:'video', done:true },
      { date:'2026年3月22日',  title:'药典复检', desc:'挥发油、农残、重金属全项合格。',                  media:'doc',   done:true },
      { date:'2026年4月12日',  title:'超细研磨', desc:'800目超细研磨，密封低温过筛。',                   media:'video', done:true },
      { date:'2026年4月23日',  title:'出库发运', desc:'药品级铝袋避光出库。',                                          done:false }
    ] },
  spec5: { id:'spec5', cat:'special', icon:'🎁', name:'商务礼盒（祁药+名贵滋补）', origin:'河北安国', batch:'BCS-2026-0426-018', price:259, unit:'盒', desc:'八大祁药精选配野山参片、石斛、花胶等名贵滋补。商务宴请、尊贵馈赠的高端之选。', tags:['名贵滋补','商务尊赠','限量匠造'],
    info:{ '产品名称':'商务礼盒（祁药+名贵滋补）','原产地':'河北安国','生产日期':'2026-04-24','保质期':'12个月','内含':'祁药八品 + 野山参片/石斛/花胶等名贵滋补','认证':'多项认证 · 限量编号' },
    timeline:[
      { date:'2026年4月10日',  title:'甄选组品', desc:'祁药八品 + 名贵滋补品逐一甄选当季最佳。',                        done:true },
      { date:'2026年4月18日',  title:'匠造包装', desc:'实木礼盒手工镶嵌，丝绒内衬，激光编号。',          media:'video', done:true },
      { date:'2026年4月24日',  title:'尊享出库', desc:'顺丰尊享配送，配鉴定证书与养生手册。',                          done:false }
    ] }
};

const JIEQI = [
  { id:'lichun',    name:'立春', date:'2026-02-04', end:'2026-02-17', season:'spring', poem:'东风解冻始萌生', products:['easy2','easy5'],        intro:'立春为岁首，阳气初升，万物复苏。宜舒肝理气，健脾升阳。' },
  { id:'yushui',    name:'雨水', date:'2026-02-18', end:'2026-03-04', season:'spring', poem:'天街小雨润如酥', products:['easy6','easy2'],        intro:'雨水湿气渐生，寒湿交攻。宜健脾祛湿，慎防关节寒痹。' },
  { id:'jingzhe',   name:'惊蛰', date:'2026-03-05', end:'2026-03-19', season:'spring', poem:'春雷惊百虫蛰伏', products:['spec4','easy6'],        intro:'惊蛰春雷始鸣，阳气上升。宜疏肝养肝，祛风防过敏。' },
  { id:'chunfen',   name:'春分', date:'2026-03-20', end:'2026-04-04', season:'spring', poem:'仲春初四日花朝', products:['easy1','easy3'],        intro:'春分昼夜均分，阴阳调和。宜清肝明目，平衡作息。' },
  { id:'qingming',  name:'清明', date:'2026-04-05', end:'2026-04-19', season:'spring', poem:'清明时节雨纷纷', products:['easy4','easy1','spec2'], intro:'清明天气清朗。宜清肝明目，降肝火，情志当舒。' },
  { id:'guyu',      name:'谷雨', date:'2026-04-20', end:'2026-05-04', season:'spring', poem:'谷雨润田百谷生', products:['easy6','easy3','spec4'], intro:'谷雨雨生百谷。湿气渐重，宜健脾祛湿，为入夏做准备。' },
  { id:'lixia',     name:'立夏', date:'2026-05-05', end:'2026-05-20', season:'summer', poem:'槐柳阴初密',     products:['easy4','spec2'],        intro:'立夏万物繁茂，心火渐旺。宜养心安神，饮食清淡。' },
  { id:'xiaoman',   name:'小满', date:'2026-05-21', end:'2026-06-04', season:'summer', poem:'夏熟作物籽渐盈', products:['easy6','easy5'],        intro:'小满湿热交蒸，宜健脾利湿。' },
  { id:'mangzhong', name:'芒种', date:'2026-06-05', end:'2026-06-20', season:'summer', poem:'芒种忙忙抢收种', products:['easy2','home4'],        intro:'芒种暑湿当令，宜调理脾胃。' },
  { id:'xiazhi',    name:'夏至', date:'2026-06-21', end:'2026-07-06', season:'summer', poem:'昼长一线添梧阴', products:['home1','home3'],        intro:'夏至阳气至盛，阴气始生。宜宁心安神。' },
  { id:'xiaoshu',   name:'小暑', date:'2026-07-07', end:'2026-07-21', season:'summer', poem:'温风至蟋居壁',   products:['home4','easy8'],        intro:'小暑静心消暑，养阴润肺。' },
  { id:'dashu',     name:'大暑', date:'2026-07-22', end:'2026-08-06', season:'summer', poem:'盛夏极热腐草萤', products:['easy8','home1'],        intro:'大暑心火易旺。宜清热解暑，养阴润肺。' },
  { id:'liqiu',     name:'立秋', date:'2026-08-07', end:'2026-08-22', season:'autumn', poem:'凉风至一叶知秋', products:['easy7','spec1'],        intro:'立秋虽暑未消，已有凉意。宜养肺润燥。' },
  { id:'chushu',    name:'处暑', date:'2026-08-23', end:'2026-09-06', season:'autumn', poem:'处暑天不暑炎',   products:['easy8','spec1'],        intro:'处暑秋燥渐显。宜滋阴润燥。' },
  { id:'bailu',     name:'白露', date:'2026-09-07', end:'2026-09-22', season:'autumn', poem:'蒹葭苍苍白露为霜', products:['easy7','spec3'],      intro:'白露阴气渐重。宜润肺防燥。' },
  { id:'qiufen',    name:'秋分', date:'2026-09-23', end:'2026-10-07', season:'autumn', poem:'秋分一半暑一半寒', products:['easy1','spec2','spec5'], intro:'秋分阴阳平衡。宜清肝明目，调和阴阳。' },
  { id:'hanlu',     name:'寒露', date:'2026-10-08', end:'2026-10-22', season:'autumn', poem:'寒露凝霜晚桂香', products:['easy2','spec3'],        intro:'寒露气温骤降。宜温补气血，润肺防燥。' },
  { id:'shuangjiang', name:'霜降', date:'2026-10-23', end:'2026-11-06', season:'autumn', poem:'霜叶红于二月花', products:['home3','home1'],      intro:'霜降秋末。宜温补肝肾。' },
  { id:'lidong',    name:'立冬', date:'2026-11-07', end:'2026-11-21', season:'winter', poem:'立冬小雪万物藏', products:['home2','home5'],        intro:'立冬阳气潜藏。宜温补气血，蓄养精神。' },
  { id:'xiaoxue',   name:'小雪', date:'2026-11-22', end:'2026-12-06', season:'winter', poem:'小雪初霁冷风吹', products:['home2','home1'],        intro:'小雪天寒地冻。宜温补脾肾，驱寒保暖。' },
  { id:'daxue',     name:'大雪', date:'2026-12-07', end:'2026-12-21', season:'winter', poem:'大雪纷纷满天涯', products:['home2','home5'],        intro:'大雪宜温补气血，固护阳气。' },
  { id:'dongzhi',   name:'冬至', date:'2026-12-22', end:'2027-01-04', season:'winter', poem:'冬至阳生春又来', products:['home2','spec5','spec2'], intro:'冬至一阳生。宜温补元气。' },
  { id:'xiaohan',   name:'小寒', date:'2027-01-05', end:'2027-01-19', season:'winter', poem:'小寒腊月雪纷飞', products:['home2','home3'],        intro:'小寒宜藏精固本。' },
  { id:'dahan',     name:'大寒', date:'2027-01-20', end:'2027-02-03', season:'winter', poem:'大寒至极春将回', products:['home2','spec5'],        intro:'大寒宜温补收藏。' }
];

const EXPERTS = [
  { id:'li',   name:'李明远 教授', title:'北京中医药大学 · 主任医师 · 30年经验', speciality:'内科杂病 · 失眠眩晕', motto:'治未病，重在调和。', status:'online', statusText:'在线', rating:'4.9', consults:1286, price:88,  greet:'您好，我是李明远。中医讲"治未病"，您若有不适，不妨细说症状、起居、饮食，我们一起找出根源。' },
  { id:'wang', name:'王婉清 主任', title:'广州中医药大学 · 副主任医师 · 膳食调理', speciality:'妇科调理 · 食疗药膳', motto:'以食为药，养在日常。', status:'busy',   statusText:'忙碌', rating:'4.8', consults:942,  price:68,  greet:'您好，我是王婉清。女子以肝为先天，情志与脾胃尤为要紧。请问今日想聊些什么？' },
  { id:'chen', name:'陈国安 博士', title:'成都中医药大学 · 药学博士 · 中药鉴定', speciality:'中药辨识 · 配伍禁忌', motto:'辨真伪，识良方。',     status:'offline',statusText:'离线', rating:'4.7', consults:563,  price:58,  greet:'您好，我是陈国安。药材的真伪优劣、配伍宜忌，皆可相询。' }
];

const HOT_TOPICS = [
  { id:'sleep',   tag:'热门', text:'失眠多梦怎么调？',   hint:'李明远 等 3 位医生在答' },
  { id:'spleen',  tag:'今日', text:'换季脾胃虚弱',       hint:'王婉清 推荐食疗方' },
  { id:'qiblood', tag:'高频', text:'气血不足如何补？',   hint:'近 7 天 286 次咨询' },
  { id:'damp',    tag:'热门', text:'湿气重 · 自查与调理', hint:'陈国安 整理 5 种自查法' }
];

function getJieqiStatus(jq, now) {
  const s = new Date(jq.date + 'T00:00:00').getTime();
  const e = new Date(jq.end + 'T23:59:59').getTime();
  const t = now.getTime();
  if (t < s) return 'future';
  if (t > e) return 'past';
  return 'current';
}

function formatJieqiDate(jq) {
  return jq.date.slice(5).replace('-','.') + ' - ' + jq.end.slice(5).replace('-','.');
}

const HERBS = [
  { id:'juhua',   seq:'壹', name:'祁菊花',   latin:'Chrysanthemum morifolium', icon:'flower',   nature:'甘苦微寒·入肺肝',      effect:'清肝明目·疏散风热', usage:'沸水冲泡3-5分钟·久视屏幕者常饮', origin:'河北安国', tag:'GAP道地' },
  { id:'shanyao', seq:'贰', name:'祁山药',   latin:'Dioscorea opposita',       nature:'甘平·入脾肺肾',          effect:'健脾养胃·补肺益肾', usage:'煲汤·煮粥·蒸食皆宜',            origin:'河北安国', tag:'鲜切锁鲜', icon:'sprout' },
  { id:'yimi',    seq:'叁', name:'祁薏米',   latin:'Coix lacryma-jobi',        nature:'甘淡凉·入脾胃肺',        effect:'健脾祛湿·利水消肿', usage:'煮粥·配赤小豆·熟制破壁皆可',    origin:'河北安国', tag:'破壁锁香', icon:'sprout' },
  { id:'shashen', seq:'肆', name:'祁沙参',   latin:'Glehnia littoralis',       nature:'甘微寒·入肺胃',          effect:'养阴清肺·益胃生津', usage:'切片冲泡·配玉竹·润肺生津',      origin:'河北安国', tag:'润肺养阴', icon:'tea'    },
  { id:'baizhi',  seq:'伍', name:'祁白芷',   latin:'Angelica dahurica',        nature:'辛温·入肺胃大肠',        effect:'祛风散寒·通窍止痛', usage:'卤料·炖肉·煎鱼去腥',            origin:'河北安国', tag:'厨房常备', icon:'chime'  },
  { id:'ziwan',   seq:'陆', name:'祁紫菀',   latin:'Aster tataricus',          nature:'苦辛温·入肺',            effect:'润肺下气·消痰止咳', usage:'煎服·冲泡·超细粉',              origin:'河北安国', tag:'润肺下气', icon:'sprout' },
  { id:'jiesui',  seq:'柒', name:'祁芥穗',   latin:'Schizonepeta tenuifolia',  nature:'辛微温·入肺肝',          effect:'祛风解表·散寒止痒', usage:'煎服·外敷·超细粉',              origin:'河北安国', tag:'祛风解表', icon:'sprout' },
  { id:'yuzhu',   seq:'捌', name:'玉竹',     latin:'Polygonatum odoratum',     nature:'甘平·入肺胃',            effect:'滋阴润肺·养胃生津', usage:'炖汤·煲粥·配沙参百合',          origin:'河北安国', tag:'滋阴润肺', icon:'tea'    }
];

const ORIGIN_POINTS = [
  { id:'juhua',   name:'祁菊花', top:'28%', left:'30%' },
  { id:'shanyao', name:'祁山药', top:'38%', left:'58%' },
  { id:'yimi',    name:'祁薏米', top:'50%', left:'22%' },
  { id:'shashen', name:'祁沙参', top:'60%', left:'70%' },
  { id:'baizhi',  name:'祁白芷', top:'72%', left:'40%' },
  { id:'ziwan',   name:'祁紫菀', top:'35%', left:'75%' },
  { id:'jiesui',  name:'祁芥穗', top:'66%', left:'55%' },
  { id:'yuzhu',   name:'玉竹',   top:'55%', left:'42%' }
];

const ROUTES = [
  { id:'r1', name:'一日游 · 药都寻源',    price:128, days:'1天',    hi:'东方镇药田→药王庙→老药店体验', cap:20, tag:'亲子首选' },
  { id:'r2', name:'二日游 · 本草研学',    price:468, days:'2天1晚', hi:'药田采摘→GAP基地→非遗炮制→中医课堂', cap:15, tag:'深度研学' },
  { id:'r3', name:'三日游 · 大医精诚',    price:888, days:'3天2晚', hi:'全程VIP·名医问诊·私人药膳·药浴温泉', cap:10, tag:'高端定制' },
  { id:'r4', name:'小中医研学营',         price:168, days:'1天',    hi:'辨药·制香囊·认穴位·中药故事',       cap:25, tag:'6-12岁' }
];

const GIFT_BOXES = [
  { id:'b1', name:'素雅·小盒',  price:28,  cap:6,  desc:'6 件位，新中式素雅礼盒' },
  { id:'b2', name:'雅致·中盒',  price:58,  cap:8,  desc:'8 件位，雅致洒金纸盒' },
  { id:'b3', name:'尊享·大盒',  price:128, cap:10, desc:'10 件位，漆木烫金礼盒' }
];

const REWARDS = [
  { id:'rw1', name:'¥10 无门槛券', cost:500,  stock:'库存充足', icon:'coin' },
  { id:'rw2', name:'¥30 满99券',   cost:1200, stock:'库存充足', icon:'coin' },
  { id:'rw3', name:'祁菊花茶包',   cost:2000, stock:'剩 32 份',  icon:'tea'  },
  { id:'rw4', name:'研学一日游券', cost:8800, stock:'剩 5 份',   icon:'route'},
  { id:'rw5', name:'亲民礼盒',     cost:9999, stock:'剩 10 份',  icon:'gift' }
];

const EARN_ITEMS = [
  { id:'e1', icon:'calendar', title:'每日签到', desc:'连续 7 日额外奖励',  pts:'+5'  },
  { id:'e2', icon:'cart',     title:'下单购物', desc:'实付 ¥1 = 1 积分',   pts:'+N'  },
  { id:'e3', icon:'scan',     title:'扫码溯源', desc:'每个新批次',         pts:'+10' },
  { id:'e4', icon:'clipboard',title:'完善档案', desc:'填写体质/过敏',      pts:'+20' },
  { id:'e5', icon:'user',     title:'邀请好友', desc:'好友首单后双方得',    pts:'+50' }
];

Object.keys(PRODUCTS).forEach(id => {
  const image = PRODUCT_IMAGES[id];
  if (image) PRODUCTS[id].image = image;
});

module.exports = {
  PRODUCTS, JIEQI, EXPERTS, HOT_TOPICS,
  HERBS, ORIGIN_POINTS, ROUTES, GIFT_BOXES, REWARDS, EARN_ITEMS,
  getJieqiStatus, formatJieqiDate
};
