<?php
    require  'config.php';
	
	$_pass =sha1($_POST['pass']);
    $query = "INSERT INTO user_msg(user,pass,email,birthday,date)
              VALUES('{$_POST['user']}','{$_POST['pass']}','{$_POST['email']}','{$_POST['birthday']}',NOW())";
			  
			  
     mysql_query($query) or die('新增失败' .mysql_error());
     echo mysql_affected_rows();
     mysql_close();
?>