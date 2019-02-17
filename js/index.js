$(function(){
    $("#search_button").button({
        icons:{
            primary:"ui-icon-search",
        },
    });

    $("#question_button").button({
        icons:{
            primary:"ui-icon-lightbulb",
        },
    }).click(function(){
        if($.cookie("user")){
            $("#question").dialog("open");
        }else{
            $("#error").dialog("open");
            setTimeout(function(){
                $("#error").dialog("close");
                $("#login").dialog("open");
            },1000);
        }
    });

    $.ajax({
        url:"php/show_content.php" ,
        type:"POST",
        success:function(response,status,xhr){
            var json=$.parseJSON(response);
            var html="";
            var arr=[];
            var summary=[];
            $.each(json,function(index,value){
                //alert(JSON.stringify(value));
                // alert(value.title);
                // html += "<h4>"+value.user+"发表于"+value.date+"</h4><h3>"+value.title+"</h3><div class='editor'>"+value.content+"</div><div class='bottom'>0条评论<span class='down'>显示全部</span><span class='up'>收起</span></div><hr noshade='noshade' size='1'>";<dl class='comment_content'><dt>naoker</dt><dd>因为何美杉本来就好看啊！2333333333333333！</dd><dd class='date'>2018-12-12</dd></dl><dl class='comment_content'><dt>naorener</dt><dd>偷偷来个PS:因为谢鑫太丑所以衬托的何美杉更美了！</dd><dd class='date'>2018-12-12</dd></dl><dl class='comment_content'><dt>naobenger</dt><dd>楼上说的有道理！！！哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈</dd><dd class='date'>2018-12-12</dd></dl>
                html += "<h4>"+value.user+"发表于"+value.date+"</h4><h3>"+value.title+"</h3><div class='editor'>"+value.content+"</div><div class='bottom'><span class='comment' data-id='"+value.id+"'>"+value.count+"条评论</span><span class='up'>收起</span></div><hr noshade='noshade' size='1'><div class='comment_list'></div>";
        });
            $(".content").append(html);
            $.each($(".editor"),function(index,value){
               arr[index]=$(value).html();
               summary[index]=arr[index].substr(0,196);
               if( summary[index].substring(195,196)=="<"){
                   summary[index]=replacePos(summary[index],196,"");
               }
                if( summary[index].substring(194,196)=="</"){
                    summary[index]=replacePos(summary[index],196,"");
                    summary[index]=replacePos(summary[index],195,"");
                }
                if(arr[index].length>200){
                    summary[index]+="...<span class='down'>显示全部</span>";
                    $(value).html(summary[index]);
                }
                $(".bottom .up").hide();
            });
            $.each($(".editor"),function(index,value){
                $(this).on("click",".down",function(){
                    $(".editor").eq(index).html(arr[index]);
                    $(this).hide();
                    $(".bottom .up").eq(index).show();
                });
            });
            $.each($(".bottom"),function(index,value){
                $(this).on("click",".up",function(){
                    $(".editor").eq(index).html(summary[index]);
                    $(this).hide();
                    $(".editor .down").eq(index).show();
                });
            });
            $.each($(".bottom"),function(index,value){
                $(this).on("click",".comment",function(){
                    var comment_this=this;
                    if($.cookie("user")){
                        if(!$(".comment_list").eq(index).has("form").length){
                            $.ajax({
                                url:"php/show_comment.php",
                                type:"POST",
                                data:{
                                    titleid:$(comment_this).attr("data-id"),
                                },
                                beforeSend:function(jqXHR,settings){
                                    $(".comment_list").eq(index).append("<dl class='comment_load'><dd>正在加载评论</dd></dl>");
                                },
                                success:function(response,status){
                                    $(".comment_list").eq(index).find(".comment_load").hide();
                                    var json_comment=$.parseJSON(response);
                                    var count=0;
                                    $.each(json_comment,function(index2,value){
                                        count=value.count;
                                        $(".comment_list").eq(index).append("<dl class='comment_content'><dt>"+value.user+"</dt><dd>"+value.comment+"</dd><dd class='date'>"+value.date+"</dd></dl>");
                                    });
                                    $(".comment_list").eq(index).append("<dl><dd><span class='load_more'>加载更多评论</span></dd></dl>")
                                    var page=2;
                                    if(page>count){
                                        // $(".comment_list").eq(index).find(".load_more").off("click");
                                        $(".comment_list").eq(index).find(".load_more").hide();
                                    }
                                    $(".comment_list").eq(index).find(".load_more").button().on("click",function(){
                                        $(".comment_list").eq(index).find(".load_more").button("disable");//防止重复点击
                                        $.ajax({
                                            url:"php/show_comment.php",
                                            type:"POST",
                                            data:{
                                                titleid:$(comment_this).attr("data-id"),
                                                page:page,
                                            },
                                            beforeSend:function(jqXHR,settings){
                                                $(".comment_list").eq(index).find(".load_more").html("<img src='img/more_load.gif'>");
                                            },
                                            success:function(response,status){
                                                var json_comment_more=$.parseJSON(response);
                                                $.each(json_comment_more,function(index3,value){
                                                    $(".comment_list").eq(index).find(".comment_content").last().after("<dl class='comment_content'><dt>"+value.user+"</dt><dd>"+value.comment+"</dd><dd class='date'>"+value.date+"</dd></dl>");
                                                });
                                                $(".comment_list").eq(index).find(".load_more").button("enable");
                                                $(".comment_list").eq(index).find(".load_more").html("");
                                                page++;
                                                if(page>count){
                                                    // $(".comment_list").eq(index).find(".load_more").off("click");
                                                    $(".comment_list").eq(index).find(".load_more").hide();
                                                }
                                            },
                                        });
                                    });

                                    $(".comment_list").eq(index).append("<form><dl class='comment_add'><dt><textarea name='comment' rows='3'></textarea></dt><dd><input type='hidden' name='titleid' value= '"+$(comment_this).attr("data-id")+"'><input type='hidden' name='user' value='"+$.cookie("user")+"'><input type='button' value='发表'></dd></dl></form>");
                                    $(".comment_list").eq(index).find("input[type=button]").button().click(function(){
                                        var _this=this;
                                        $(".comment_list").eq(index).find("form").ajaxSubmit({
                                            url:"php/add_comment.php",
                                            type:"POST",
                                            beforeSubmit:function(formData,jqForm,options){
                                                $("#loading").dialog("open");
                                                $(_this).button("disable");
                                            },
                                            success:function(responseText,statusText){
                                                if(responseText){
                                                    $(_this).button("enable");
                                                    $("#loading").css("background","url(img/reg_succ.png) no-repeat 20px center").html("数据新增成功");
                                                    setTimeout(function(){
                                                        var date=new Date();

                                                        $("#loading").dialog("close");
                                                        $(".comment_list").eq(index).prepend("<dl class='comment_content'><dt>"+$.cookie("user")+"</dt><dd>"+$(".comment_list").eq(index).find("textarea").val()+"</dd><dd>"+date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+"-"+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+"</dd></dl>");
                                                        $(".comment_list").eq(index).find("form").resetForm();
                                                        $("#loading").css("background","url(img/loading.gif ) no-repeat 20px center").html("数据交互中...");
                                                    },1000);
                                                }
                                            },
                                        });
                                    });
                                },
                            });
                        }
                        if($(".comment_list").eq(index).is(":hidden")){
                            $(".comment_list").eq(index).show();

                        }else{
                            $(".comment_list").eq(index).hide();
                        }

                    }else{
                        $("#error").dialog("open");
                        setTimeout(function(){
                            $("#error").dialog("close");
                            $("#login").dialog("open");
                        },1000);
                    }
                });
            });
            // $.each($(".editor"),function(index,value){
            //     arr[index]= $(value).height();
            //     if($(value).height()>100){
            //         $(value).next(".bottom").find(".up").hide();
            //     }
            //     $(value).height(100);
            // });
            // $.each($(".bottom .down"),function(index,value){
            //     $(this).click(function(){
            //         $(this).parent().prev().height(arr[index]);
            //         $(this).hide();
            //         $(this).parent().find(".up").show();
            //     });
            // });
            // $.each($(".bottom .up"),function(index,value){
            //     $(this).click(function(){
            //         $(this).parent().prev().height(100);
            //         $(this).hide();
            //         $(this).parent().find(".down").show();
            //     });
            // });
        },
    });

    $("#question").dialog({
        autoOpen:false,
        width:500,
        height:360,
        show:"blind",
        hide:"slide",
        draggable:false,
        modal:true,
        resizable:false,
        closeText:"关闭",
        buttons:{
            "发布":function(){
                $(this).ajaxSubmit({
                    url:"php/add_content.php",
                    type:"POST",
                    data:{
                        user:$.cookie("user"),
                    },
                    beforeSubmit:function(formData,jqForm,options){
                        $("#loading").dialog("open");
                        $("#question").dialog("widget").find("button").eq(1).button("disable");
                    },
                    success:function(responseText,statusText){
                        if(responseText){
                            $("#question").dialog("widget").find("button").eq(1).button("enable");
                            $("#loading").css("background","url(img/reg_succ.png) no-repeat 20px center").html("数据新增成功");
                            setTimeout(function(){
                                $("#loading").dialog("close");
                                $("#question").dialog("close");
                                $("#question").resetForm();
                                $("#loading").css("background","url(img/loading.gif ) no-repeat 20px center").html("数据交互中...");
                            },1000);
                        }
                    },
                });
            },
        },
    });
    $("#error").dialog({
        autoOpen:false,
        modal:true,
        closeOnEscape:false,
        resizable:false,
        draggable:false,
        width:170,
        height:50,
    }) .parent().find(".ui-widget-header").hide();

    $("#reg_a").click(function(){
        $("#reg").dialog("open");//不传值表示创建
    });

    $("#member,#logout").hide();
    if($.cookie("user")){
        $("#member,#logout").show();
        $("#reg_a,#login_a").hide();
        $("#member").html($.cookie("user"));
    }else{
        $("#member,#logout").hide();
        $("#reg_a,#login_a").show();
    }
    $("#logout").click(function(){
        $.removeCookie("user");
        window.location.href="/";
    });

    $("#loading").dialog({
        autoOpen:false,
        modal:true,
        closeOnEscape:false,
        resizable:false,
        draggable:false,
        width:170,
        height:50,
    }).parent().find(".ui-widget-header").hide();

    $("#reg").dialog({
        autoOpen:false,
        width:324,
        height:340,
        show:"blind",
        hide:"slide",
        draggable:false,//无法移动对话框
        modal:true,//是否有遮罩
        resizable:false,//能否调整对话框大小
        closeText:"关闭",//关闭按钮的文字
        buttons:{
            "提交":function(){
                $(this).submit();
            },
        },
    }).buttonset().validate({
        submitHandler:function(form){
            $(form).ajaxSubmit({
                url:"php/add.php",
                type:"POST",
                beforeSubmit:function(formData,jqForm,options){
                    $("#loading").dialog("open");
                    $("#reg").dialog("widget").find("button").eq(1).button("disable");
                },
                success:function(responseText,statusText){
                    if(responseText){
                        $("#reg").dialog("widget").find("button").eq(1).button("enable");
                        $("#loading").css("background","url(img/reg_succ.png) no-repeat 20px center").html("数据新增成功");
                        $.cookie("user",$("#user").val());
                        setTimeout(function(){
                            $("#loading").dialog("close");
                            $("#reg").dialog("close");
                            $("#reg").resetForm();
                            $("#reg span.star").html("*").removeClass("succ");
                            $("#loading").css("background","url(img/loading.gif ) no-repeat 20px center").html("数据交互中...");
                            $("#member,#logout").show();
                            $("#reg_a,#login_a").hide();
                            $("#member").html($.cookie("user"));
                        },1000);
                    };
                },
            })
        },
        showErrors:function(errorMap,errorList){
            var errors=this.numberOfInvalids();
            if(errors>0){
                $("#reg").dialog("option","height",errors*20+340);
            }else{
                $("#reg").dialog("option","height",340);
            }
            this.defaultShowErrors();
        },
        highlight:function(element,errorClass){
            $(element).css("border","1px solid #630");
            $(element).parent().find("span").html("*").removeClass("succ");
        },
        unhighlight:function(element,errorClass){
            $(element).css("border","1px solid #ccc");
            $(element).parent().find("span").html("&nbsp&nbsp&nbsp&nbsp;").addClass("succ");
        },
        errorLabelContainer :"ol.reg_error",
        wrapper:"li",
        rules:{
            user:{
                required:true,
                minlength:2,
                remote:{
                    url:"php/is_user.php",
                    type:"POST",
                }
            },
            pass:{
                required:true,
                minlength:6,
            },
            email:{
                required:true,
                email:true,
            },
            date:{
                date:true,
            },
        },
        messages:{
            user:{
                required:"账号不得为空！",
                minlength: $.validator.format( "账号不得小于{0}位！" ),
                remote:"账号被占用！",
            },
            pass:{
                required:"密码不得为空！",
                minlength: $.validator.format( "密码不得小于{0}位！" ),
            },
            email:{
                required:"邮箱不得为空！",
                minlength:"请输入正确的邮箱地址！",
            },
        }
    });
    var accounts=["naoker","naoguar","naorener","naobenger"];
    $("#user").autocomplete({
        source:accounts,
        minLength:1,
        delay:0,
        autoFocus:false,
    });
    $("#email").autocomplete({
        delay:0,
        autoFocus:true,//默认首选
        source:function(request,response){
            var hosts=["qq.com","163.com","sina.com","gmail.com","hotmail.com"],
                term=request.term,
                ix=term.indexOf("@"),
                name=term,
                host="",
                result=[];
            result.push(term);//没有提供选项时显示提示
            if(ix>-1){
                name=term.slice(0,ix),
                    host=term.slice(ix+1);
            }
            if(name){
                var findedHosts=(host ? $.grep(hosts,function(value,index){//找到的域名=在域名库中过滤后得到的域名数组//value记录所有域名库中的值
                        return value.indexOf(host)>-1}) : hosts),
                    findedResult=$.map(findedHosts,function(value,index){//将findHosts中的值带进去加点别的东西生成并输出一个新的组合
                        return name+"@"+value;//返回"用户名+@+域名"的标准格式的完整邮箱
                    });
                result=result.concat(findedResult);//concat连接两个或多个数组
            }
            response(result)
        },
    });
    $("#date").datepicker({
            changeMonth:true,
            changeYear:true,
            yearSuffix:" ",
            maxDate:0,
            yearRange:"1949:2020",
        });
    $("#reg input[type=radio]").button();

    $("#login_a").click(function(){
        $("#login").dialog("open");
    });
    $("#login").dialog({
        autoOpen:false,
        width:324,
        height:240,
        show:"blind",
        hide:"slide",
        draggable:false,
        modal:true,
        resizable:false,
        open:function(e,ui){
            alert("已注册用户请直接登录！")
        },
        buttons:{
            "登陆":function(){
                // alert($("#expires").is(":checked"));//伪类判断是否存在
                $(this).submit();
            },
            "取消":function(){
                $(this).dialog("close");
            },
        },
    }).validate({
        submitHandler:function(form){
            $(form).ajaxSubmit({
                url:"php/login.php",
                type:"POST",
                beforeSubmit:function(formData,jqForm,options){
                    $("#loading").dialog("open");
                    $("#login").dialog("widget").find("button").eq(1).button("disable");
                },
                success:function(responseText,statusText){
                    // alert(responseText);
                    if(responseText){
                        $("#login").dialog("widget").find("button").eq(1).button("enable");
                        $("#loading").css("background","url(img/reg_succ.png) no-repeat 20px center").html("您已成功登陆");
                        if($("#expires").is(":checked")){
                            $.cookie("user",$("#login_user").val(),{
                                expires:7,
                            });
                        }else{
                            $.cookie("user",$("#login_user").val());
                        }
                        setTimeout(function(){
                            $("#loading").dialog("close");
                            $("#login").dialog("close");
                            $("#login").resetForm();
                            $("#login span.star").html("*").removeClass("succ");
                            $("#loading").css("background","url(img/loading.gif ) no-repeat 20px center").html("数据交互中...");
                            $("#member,#logout").show();
                            $("#reg_a,#login_a").hide();
                            $("#member").html($.cookie("user"));
                        },1000);
                    };
                },
            })
        },
        showErrors:function(errorMap,errorList){
            var errors=this.numberOfInvalids();
            if(errors>0){
                $("#login").dialog("option","height",errors*20+240);
            }else{
                $("#login").dialog("option","height",240);
            }
            this.defaultShowErrors();
        },
        highlight:function(element,errorClass){
            $(element).css("border","1px solid #630");
            $(element).parent().find("span").html("*").removeClass("succ");
        },
        unhighlight:function(element,errorClass){
            $(element).css("border","1px solid #ccc");
            $(element).parent().find("span").html("&nbsp&nbsp&nbsp&nbsp;").addClass("succ");
        },
        errorLabelContainer :"ol.login_error",
        wrapper:"li",
        rules:{
            login_user:{
                required:true,
                minlength:2,
                },
            login_pass:{
                required:true,
                minlength:6,
                remote:{
                    url:"php/login.php",
                    type:"POST",
                    data:{
                        login_user:function(){
                            return $("#login_user").val();
                        },
                    },
                },
            },
        },
        messages:{
            login_user:{
                required:"账号不得为空！",
                minlength: $.validator.format( "账号不得小于{0}位！" ),
            },
            login_pass:{
                required:"密码不得为空！",
                minlength: $.validator.format( "密码不得小于{0}位！" ),
                remote:"账号或密码不正确！",
            },
        }
    });

    $("#tabs").tabs({
        collapsible:true,
        // event:"mouseover",
        // active:1,
        active:false,
        heightStyle:"auto",
        show:true,
        hide:false,
    });
    $("#accordion").accordion({
        collapsible:true,
        heightStyle:"content",
        icons:{
            "header":"ui-icon-plus",
            "activeHeader":"ui-icon-minus",
        }
    });

});
function replacePos(strObj,pos,replaceText){
    return strObj.substr(0,pos-1)+replaceText+strObj.substring(pos,strObj.length);
}