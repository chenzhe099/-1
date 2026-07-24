with open('d:\\gjcx\\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 找到所有 </section> 的位置
section_ends = [m.start() for m in __import__('re').finditer('</section>', content)]

print(f"找到 {len(section_ends)} 个 </section> 标签")

if section_ends:
    # 找到最后一个 </section>
    last_section_end = max(section_ends)
    # 找到 </div> </main> </div> 的位置
    main_end = content.find('</main>', last_section_end)
    body_end = content.find('</body>', main_end)

    if main_end != -1 and body_end != -1:
        # 保留到 </body></html>
        clean_content = content[:last_section_end + len('</section>')] + '\n                </section>\n            </div>\n        </main>\n    </div>\n\n    <script src="js/app.js"></script>\n    <script src="js/charts.js"></script>\n</body>\n</html>'

        # 保存清理后的文件
        with open('d:\\gjcx\\index.html', 'w', encoding='utf-8') as f:
            f.write(clean_content)

        print(f"清理完成！")
        print(f"清理前长度: {len(content)} 字符")
        print(f"清理后长度: {len(clean_content)} 字符")
    else:
        print("未找到 </main> 或 </body>")
        print(f"last_section_end: {last_section_end}, main_end: {main_end}, body_end: {body_end}")
