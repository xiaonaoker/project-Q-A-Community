<?php
    sleep(1);
    require  'config.php';
	
	$_pass =sha1($_POST['pass']);
    $query = "INSERT INTO user(user,pass,email,birthday,sex,date)
              VALUES('{$_POST['user']}','{$_POST['pass']}','{$_POST['email']}','{$_POST['birthday']}','{$_POST['sex']}',NOW())";
			  
			  
     mysql_query($query) or die('ÐÂÔöÊ§°Ü' .mysql_error());
     echo mysql_affected_rows();
     mysql_close();
?>