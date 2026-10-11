export function makeSample(){
 const c=document.createElement('canvas');c.width=1160;c.height=910;const g=c.getContext('2d');
 const text=(t,x,y,size=24,color='#242b2a',weight=400)=>{g.fillStyle=color;g.font=weight+' '+size+'px Arial';g.fillText(t,x,y);};
 g.fillStyle='#ffffff';g.fillRect(0,0,c.width,c.height);g.fillStyle='#f4f5f2';g.fillRect(0,0,1160,70);
 text('FIELD NOTES  /  APPLICATIONS',45,43,18,'#68716d',600);text('Receipt preview',915,43,18,'#68716d');
 g.fillStyle='#242b2a';g.fillRect(45,116,42,42);text('↗',54,147,25,'#ffffff');text('Community Workshop',104,145,25,'#242b2a',600);
 text('Your application is in.',45,228,44,'#242b2a',600);text('Keep this receipt for your own records.',45,273,23,'#68716d');
 g.strokeStyle='#d6ddd4';g.beginPath();g.moveTo(45,316);g.lineTo(1115,316);g.stroke();
 const row=(label,value,y)=>{text(label,45,y,20,'#68716d');text(value,350,y,27);};
 row('Participant','Jordan Example',376);row('Email','jordan@example.com',440);row('Phone','202-555-0147',504);row('Session','Designing useful small tools',568);row('Reference','WS-26-1042',632);
 g.fillStyle='#eef3ed';g.fillRect(45,688,1070,120);text('Application received',70,728,24,'#32664e',600);text('You can share the receipt after checking the contact details.',70,771,23,'#4f6658');
 text('SYNTHETIC SAMPLE  /  NO REAL APPLICANT',45,865,16,'#68716d',600);return c;
}
