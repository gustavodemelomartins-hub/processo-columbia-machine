from pathlib import Path
import json,gzip,re,collections,bisect
p=Path('CNC/viewer/O003.json');d=json.loads(p.read_text(encoding='utf8') if p.exists() else gzip.decompress(p.with_suffix('.json.gz').read_bytes()));contours=json.loads(Path('src/project_data.json').read_text(encoding='utf8'))['contours'];lines=d['source_lines']
def ref(n):
 code=lines[n-1];m=re.match(r'\s*N(\d+)',code);return {'line':n,'n':int(m[1])if m else None,'code':code}
def inside(x,y,c):
 hit=False
 for (ax,ay),(bx,by)in zip(c,c[1:]+c[:1]):
  if (ay>y)!=(by>y) and x<(bx-ax)*(y-ay)/(by-ay)+ax:hit=not hit
 return hit
bounds=[(min(p[0]for p in c),max(p[0]for p in c),min(p[1]for p in c),max(p[1]for p in c))for c in contours]
anchors=[]
for n,l in enumerate(lines,1):
 plain=re.sub(r'\([^)]*\)','',l);z=re.search(r'Z([+-]?\d+(?:\.\d*)?)',plain)
 if z and float(z[1])==10 and re.search(r'G0?(?:0)(?![\d.])',plain):anchors.append(n)
ranges=[[]for _ in range(max(0,len(anchors)-1))]
for row in d['segments']:
 k=bisect.bisect_right(anchors,row[8])-1
 if 0<=k<len(ranges) and row[6]!=0 and row[7]==3:ranges[k].append(row)
entries=[]
for k,rows in enumerate(ranges):
 samples=[r for r in rows if min(r[2],r[5])<0][::max(1,len(rows)//300)];votes=collections.Counter();matched=0
 for r in samples:
  x,y=r[3],r[4];hits=[i for i,(a,b,c,e)in enumerate(bounds)if a<=x<=b and c<=y<=e and inside(x,y,contours[i])]
  if len(hits)==1:votes[hits[0]]+=1;matched+=1
 winner,score=votes.most_common(1)[0]if votes else(None,0);ratio=score/max(1,len(samples));resolved=winner is not None and ratio>=.95
 first=next((r for r in rows if r[6]==1 and re.search(r'G0?1(?![\d.])',lines[r[8]-1])),None)
 interval=range(anchors[k]+1,anchors[k+1]);xy=next((n for n in interval if re.search(r'G0?(?:0)(?![\d.])',lines[n-1]) and 'X'in lines[n-1]and'Y'in lines[n-1]),None)
 if xy is None and k==0:xy=next((n for n in range(anchors[k]-1,0,-1)if re.search(r'G0?(?:0)(?![\d.])',lines[n-1])and'X'in lines[n-1]and'Y'in lines[n-1]),None)
 entries.append({'cavityId':winner+1 if resolved else None,'sequence':k+1,'geometricMatch':resolved,'sampleAgreement':round(ratio,4),'z10Before':ref(anchors[k]),'positionXY':ref(xy)if xy else None,'firstG1':ref(first[8])if first else None,'z10After':ref(anchors[k+1]),'feedAtEntry':first[10]if first else None,'wcs':sorted({'G'+str(r[13])for r in rows}),'tools':sorted({r[7]for r in rows})})
result={'file':'O003.TAP','sha256':d['meta']['sha256'],'provenance':'Z10 e G1 extraídos do TAP; associação espacial aos contornos ilustrativos','entries':entries}
assert len(entries)==12 and {e['cavityId']for e in entries}==set(range(1,13))
Path('src/cavity_data.json').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':')),encoding='utf8');Path('CNC/Cavidades_O003.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
print([(e['cavityId'],e['sampleAgreement'],e['z10Before']['line'],e['firstG1']['line'],e['z10After']['line'])for e in entries])
