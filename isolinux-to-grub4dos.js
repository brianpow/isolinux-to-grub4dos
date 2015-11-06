String.prototype.parseisolinux = function(){
	dicts={
	"menu label ":["title ",0],
	"menu quit":["commandline",1],
	"kernel ":["kernel ",1],
	}
	direct_tr={"timeout ":["timeout ",1]}
	rows=this.split("\n");
	entries=[]
	entry=[]
	for(var i in rows)
	{
		row=rows[i].trim();
		if (row=="")continue;
		for(var k in direct_tr)
		{
			if(row.substr(0,k.length)==k)
			{
				tmp=[]
				tmp[direct_tr[k][0].trim()]=row.substr(k.length);
				entries.push(tmp)
			}
		}
		
		if(row.substr(0,5)=="label")
		{
			if(Object.size(entry))
			{
				entries.push(entry)
				entry=[]
			}
			entry['label']=row.substr(5).trim()
		}
		else if (Object.size(entry))
		{
			for(var k in dicts)
			{
				if(row.substr(0,k.length)==k)
				{
					entry[dicts[k][0].trim()]="";
					//console.log(k+", " + dicts[k][0]+", " + dicts[k][1])
					//for(l=0;l<dicts[k][1];l++)
					//	entry[dicts[k][0]]=entry[dicts[k][0]];
					entry[dicts[k][0].trim()]+=row.substr(k.length);
					//console.log(k +"," +entry[dicts[k][0]]);
				}
			}
			
			if(row.substr(0,7)=="append ")
			{
				append_row=row.substr(7);
				append_cells=append_row.split(" ");
				for(var i in append_cells)
				{
					cell=append_cells[i];
					if(cell.substr(0,7)=="initrd=")
						entry['initrd']=cell.substr(7);
					else
						entry['kernel']+=" " + cell
				}
			}
			else if(row.substr(0,10)=="localboot ")
			{
				if(row.substr(10,2)=="0x")
				{
					idx=parseInt(row.substr(12,2));
					if(idx<80)
					{
						entry['rootnoverify']="(fd"+idx + ")";
					}
					else
					{
					entry['rootnoverify']="(hd"+(idx-80) + ")";
					}
					entry['chainloader']="+1";
				}
			}
		}
		else if(row.indexOf("include ")==0)
		{
		}
		else
		{
			//default
			//say
			//config
			
			console.log("ignored: " + row);
		}
	}
	if(Object.size(entry))
	{
		entries.push(entry)
		entry=[]
	}
	console.log(entry);
	console.log(entries);
	return entries;
}
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
function buildmenu(entries,isofile)
{
	menu=""
	for(var i in entries)
	{
		entry=entries[i];
		if(menu!="")
			menu+="\n";
		
		if(entry['title'])
		{
			menu+="title " + entry['title'] + "\n";
			if(isofile && entry['initrd'])
			{
				menu+="\tset iso=" + isofile + "\n"
				menu+="\tmap %iso% (hd32)" + "\n"
				menu+="\tmap --hook" + "\n"
				menu+="\troot (hd32)" + "\n"
			}
			if(entry['kernel'])
			{
				menu+="\tkernel " + entry['kernel'];
				if (isofile && entry['initrd'])
					menu+=" findiso=%iso% iso-scan/filename=%iso%";
				menu+= "\n"
			}
			if(entry['initrd'])
				menu+="\tinitrd " + entry['initrd']+ "\n";
		for(var i in entry)
			if(['title','kernel','initrd','label'].indexOf(i) == -1)
				menu+="\t" + i + " " + entry[i] + "\n";
		}
		else
		{
		for(var i in entry)
			if(['title','kernel','initrd','label'].indexOf(i) == -1)
				menu+=i + " " + entry[i] + "\n";
		}
	}
	return menu;
}
/*
set iso=/iso/kali-linux-2.0-amd64.iso
map %iso% (hd32)
map --hook
root (hd32)
kernel /live/vmlinuz boot=live username=root hostname=kali findiso=%iso% 
initrd /live/initrd.img
*/