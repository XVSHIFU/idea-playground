from pathlib import Path
import re, json, hashlib

ROOT=Path(r'C:\Users\Xvsf\Desktop\体验不同世界-提示词分享9.30\成品提示词')
WORK=Path(__file__).parent
SKIP=Path('国漫国动/我在精神病院斩神.txt')

def group(s,i):
    while i<len(s) and s[i].isspace(): i+=1
    if i>=len(s) or s[i]!='{': raise ValueError(('expected brace',s[i:i+80]))
    start=i; depth=1;i+=1
    while i<len(s):
        if s[i]=='\\' and i+1<len(s) and s[i+1] in '{}%&#_': i+=2;continue
        if s[i]=='{':depth+=1
        if s[i]=='}':depth-=1
        if not depth:return start,i,s[start+1:i]
        i+=1
    raise ValueError('Unbalanced braces')

def boxes(s):
    pos=0
    while True:
        m=re.search(r'\\fcolorbox\s*\{',s[pos:])
        if not m:return
        start=pos+m.start();i=start+len(r'\fcolorbox')
        for _ in range(3):a,b,c=group(s,i);i=b+1
        yield start,i,s[start:i]
        pos=i

def convert(s):
    # Some prose embeds a JSON-like doubly escaped copy of the opening panel.
    s=re.sub(r'\\\\(?=[A-Za-z])',r'\\',s)
    # Avoid text-mode middle-dot expansion through an unsupported math macro.
    s=s.replace('·','・')
    s=re.sub(r'(?<!\\)_',r'\\_',s)
    s=re.sub(r'(?m)^([ \t]*)(\[[^\r\n]+\])[ \t\r]*$',r'\1% 模板填充说明（不输出）：\2',s)
    missing=s.count(r'\begin{array}')-s.count(r'\end{array}')
    if missing>0:
        # Repair source templates missing the outer array terminator.
        last=s.rfind('}')
        s=s[:last]+('\n'+r'\end{array}')*missing+'\n'+s[last:]
    s=re.sub(r'\\(normalsize|small|large|Large)\s+([^{}\\]+)',lambda m:'\\'+m[1]+r' \text{'+m[2]+'}',s)
    # scalebox is not part of the tested renderer subset; retain contents and natural size.
    while r'\scalebox' in s:
        k=s.index(r'\scalebox');a,b,_=group(s,k+len(r'\scalebox'));a2,b2,body=group(s,b+1)
        s=s[:k]+'{'+body+'}'+s[b2+1:]
    def walk(t):
        pos=0;out=''
        while True:
            m=re.search(r'\\(fcolorbox|colorbox)\s*\{',t[pos:])
            if not m:return out+t[pos:]
            k=pos+m.start();cmd=m[1];i=k+len(cmd)+1
            for _ in range(3 if cmd=='fcolorbox' else 2):a,b,body=group(t,i);i=b+1
            body=walk(body)
            stripped=body.strip()
            if not (stripped.startswith('$') and stripped.endswith('$')):body='$'+body+'$'
            out+=t[pos:a+1]+body+'}';pos=i
    return walk(s)

RULES=r'''【ChatGPT 面板兼容规则】
本段仅规定显示格式，不改变下文世界观、剧情、数值、触发条件及首轮流程。与旧版显示要求冲突时，以本段及已适配模板为准。
1. 按模板输出供界面渲染的 LaTeX，外层使用 \[ 与 \]；不要用代码块、引用或反引号包裹实际面板。原本规定为纯文字的面板仍用纯文字。
2. 保留色框内部的成对 $：\fcolorbox 的第三参数、\colorbox 的第二参数使用 {$ ... $}。嵌套色块按各自模板保留配对，不要因外层已有公式分隔符而删除内部 $。
3. 普通字段文字使用 \text{...}，粗体使用 \textbf{...}；仅填占位符，保留括号、颜色与数组换行。字段文字中的 %、_、&、# 分别写为 \%、\_、\&、\#，颜色参数中的 # 与数组列分隔符 & 不作转义。
4. 不使用 \scalebox 缩放整张卡片；长文字按语义分行，保留字段含义。动态进度条的长度占位符先换成带单位的数值，再输出公式。
5. 开场中重复出现的面板也使用适配结构；JSON 风格片段中的转义只用于记录模板，实际回复输出单层 LaTeX 命令，不输出字面量 \\n。
6. 继续遵循原文的降级与恢复触发方式；界面是否渲染成功以玩家反馈为准，不声称能自动看到玩家界面。
【兼容规则结束】

'''

records=[];tests=[]
for p in sorted(ROOT.rglob('*.txt')):
    rel=p.relative_to(ROOT)
    if rel.parts[0]=='ChatGPT' or rel==SKIP:continue
    raw=p.read_bytes();s=raw.decode('utf-8-sig');original=s
    # Normalize escaped commands only inside complete box expressions.
    replacements=[]
    for a,b,expr in boxes(s):
        if a and s[a-1]=='\\':a-=1
        replacements.append((a,b,convert(expr)))
    for a,b,expr in reversed(replacements):s=s[:a]+expr+s[b:]
    s=s.replace('DeepSeek','ChatGPT').replace('deepseek','ChatGPT')
    s=s.replace(r'\\(',r'\(').replace(r'\\)',r'\)')
    s=s.replace(r'\(',r'\[').replace(r'\)',r'\]')
    s=s.replace(r'\（',r'\[').replace(r'\）',r'\]')
    # Three Kingdoms has a divider accidentally placed outside its formula.
    s=re.sub(r'\\\]([ \t]+)(\\textcolor[^\r\n]+)',lambda m:m[1]+m[2]+r' \]',s)
    s=s.replace('禁用 \\[ \\] 块级定界符、','使用 \\[ \\] 块级定界符；禁用 ')
    s=s.replace('LaTeX 代码就是输出本身','直接输出供界面渲染的 LaTeX 公式')
    s=s.replace('反斜杠左圆括弧','反斜杠左方括弧').replace('反斜杠右圆括弧','反斜杠右方括弧')
    s=s.replace('反斜杠加左括号','反斜杠加左方括号').replace('反斜杠加右括号','反斜杠加右方括号')
    # Keep adapter inside the advertised copyable block, if one exists.
    fence=re.search(r'^```(?:text|txt|plaintext|json)?\s*\n',s,re.M)
    if fence:s=s[:fence.end()]+RULES+s[fence.end():]
    else:s=RULES+s
    for j,(a,b,expr) in enumerate(boxes(s)):
        tests.append(dict(file=str(rel),index=j,expr=expr))
    records.append(dict(file=str(rel),text=s,sha256=hashlib.sha256(raw).hexdigest(),panels=len(replacements)))
WORK.joinpath('staged.json').write_text(json.dumps(records,ensure_ascii=False),encoding='utf-8')
WORK.joinpath('tests.json').write_text(json.dumps(tests,ensure_ascii=False),encoding='utf-8')
print('Staged',len(records),'files;',len(tests),'box expressions')
